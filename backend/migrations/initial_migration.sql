-- =====================================================
-- Database Migration: Stock Movement System
-- =====================================================
-- IMPORTANT: Always use [project_1781] schema in this file.
-- The migration runner will automatically replace [project_1781] with [project_repositoryname]
-- at runtime based on the GitHub repository name.
-- DO NOT hardcode [project_XXX] - always use [project_1781]!
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

/**
 * @table stockMovement Stock movement records for inventory tracking
 * @multitenancy true
 * @softDelete false
 * @alias stcMov
 */
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'stockMovement' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [project_1781].[stockMovement] (
        [idStockMovement] INTEGER IDENTITY(1, 1) NOT NULL,
        [idAccount] INTEGER NOT NULL,
        [idProduct] INTEGER NOT NULL,
        [idUser] INTEGER NOT NULL,
        [movementType] INTEGER NOT NULL,
        [quantity] NUMERIC(15, 2) NOT NULL,
        [reason] NVARCHAR(200) NOT NULL,
        [referenceDocument] VARCHAR(50) NULL,
        [unitValue] NUMERIC(18, 6) NULL,
        [location] NVARCHAR(100) NULL,
        [movementDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table [project_1781].[stockMovement] created successfully';
END
GO

/**
 * @primaryKey pkStockMovement
 * @keyType Object
 */
ALTER TABLE [project_1781].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([idStockMovement]);
GO

/**
 * @foreignKey fkStockMovement_Account
 * @target dbo.account
 * @tenancy true
 */
ALTER TABLE [project_1781].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Account] FOREIGN KEY ([idAccount])
REFERENCES [project_1781].[account]([idAccount]);
GO

/**
 * @check chkStockMovement_MovementType
 * @enum {0} new_product - New product registration
 * @enum {1} entry - Stock entry
 * @enum {2} exit - Stock exit
 * @enum {3} adjustment - Stock adjustment
 * @enum {4} deletion - Product deletion
 */
ALTER TABLE [project_1781].[stockMovement]
ADD CONSTRAINT [chkStockMovement_MovementType] CHECK ([movementType] BETWEEN 0 AND 4);
GO

/**
 * @index ixStockMovement_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account]
ON [project_1781].[stockMovement]([idAccount]);
GO

/**
 * @index ixStockMovement_Product
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Product]
ON [project_1781].[stockMovement]([idAccount], [idProduct]);
GO

/**
 * @index ixStockMovement_Date
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Date]
ON [project_1781].[stockMovement]([idAccount], [movementDate]);
GO

/**
 * @index ixStockMovement_Type
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Type]
ON [project_1781].[stockMovement]([idAccount], [movementType]);
GO

/**
 * @index ixStockMovement_User
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_User]
ON [project_1781].[stockMovement]([idAccount], [idUser]);
GO

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

/**
 * @summary
 * Creates a new stock movement record
 * 
 * @procedure spStockMovementCreate
 * @schema dbo
 * @type stored-procedure
 * 
 * @endpoints
 * - POST /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier
 * 
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product identifier
 * 
 * @param {INT} movementType
 *   - Required: Yes
 *   - Description: Movement type (0-4)
 * 
 * @param {NUMERIC} quantity
 *   - Required: Yes
 *   - Description: Quantity moved
 * 
 * @param {NVARCHAR} reason
 *   - Required: Yes
 *   - Description: Movement reason
 * 
 * @param {VARCHAR} referenceDocument
 *   - Required: No
 *   - Description: Reference document number
 * 
 * @param {NUMERIC} unitValue
 *   - Required: No
 *   - Description: Unit value
 * 
 * @param {NVARCHAR} location
 *   - Required: No
 *   - Description: Storage location
 * 
 * @returns {INT} idStockMovement - Created movement identifier
 * 
 * @testScenarios
 * - Valid creation with all required parameters
 * - Validation of movement type
 * - Validation of quantity sign based on movement type
 * - Validation of product existence
 * - Validation of sufficient stock for exits
 */
CREATE OR ALTER PROCEDURE [project_1781].[spStockMovementCreate]
    @idAccount INTEGER,
    @idUser INTEGER,
    @idProduct INTEGER,
    @movementType INTEGER,
    @quantity NUMERIC(15, 2),
    @reason NVARCHAR(200),
    @referenceDocument VARCHAR(50) = NULL,
    @unitValue NUMERIC(18, 6) = NULL,
    @location NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    /**
     * @validation Parameter validation
     * @throw {parameterRequired}
     */
    IF (@idAccount IS NULL)
    BEGIN
        ;THROW 51000, 'idAccountRequired', 1;
    END;

    IF (@idUser IS NULL)
    BEGIN
        ;THROW 51000, 'idUserRequired', 1;
    END;

    IF (@idProduct IS NULL)
    BEGIN
        ;THROW 51000, 'idProductRequired', 1;
    END;

    IF (@movementType IS NULL)
    BEGIN
        ;THROW 51000, 'movementTypeRequired', 1;
    END;

    IF (@quantity IS NULL OR @quantity = 0)
    BEGIN
        ;THROW 51000, 'quantityRequired', 1;
    END;

    IF (@reason IS NULL OR LEN(@reason) < 5)
    BEGIN
        ;THROW 51000, 'reasonMinimumLength', 1;
    END;

    /**
     * @validation Movement type validation
     * @throw {invalidMovementType}
     */
    IF (@movementType NOT BETWEEN 0 AND 4)
    BEGIN
        ;THROW 51000, 'invalidMovementType', 1;
    END;

    /**
     * @validation Quantity sign validation based on movement type
     * @throw {invalidQuantitySign}
     */
    IF (@movementType IN (2) AND @quantity > 0)
    BEGIN
        ;THROW 51000, 'exitQuantityMustBeNegative', 1;
    END;

    IF (@movementType IN (0, 1, 3) AND @quantity < 0)
    BEGIN
        ;THROW 51000, 'entryQuantityMustBePositive', 1;
    END;

    /**
     * @validation Unit value validation
     * @throw {invalidUnitValue}
     */
    IF (@unitValue IS NOT NULL AND @unitValue <= 0)
    BEGIN
        ;THROW 51000, 'unitValueMustBePositive', 1;
    END;

    DECLARE @currentStock NUMERIC(15, 2);

    /**
     * @rule {fn-stock-calculation} Calculate current stock for exit validation
     */
    SELECT @currentStock = ISNULL(SUM([quantity]), 0)
    FROM [project_1781].[stockMovement]
    WHERE [idAccount] = @idAccount
      AND [idProduct] = @idProduct;

    /**
     * @validation Stock availability for exits
     * @throw {insufficientStock}
     */
    IF (@movementType = 2 AND (@currentStock + @quantity) < 0)
    BEGIN
        ;THROW 51000, 'insufficientStock', 1;
    END;

    BEGIN TRY
        BEGIN TRAN;

            /**
             * @rule {fn-movement-registration} Register stock movement
             */
            INSERT INTO [project_1781].[stockMovement] (
                [idAccount],
                [idProduct],
                [idUser],
                [movementType],
                [quantity],
                [reason],
                [referenceDocument],
                [unitValue],
                [location],
                [movementDate]
            )
            VALUES (
                @idAccount,
                @idProduct,
                @idUser,
                @movementType,
                @quantity,
                @reason,
                @referenceDocument,
                @unitValue,
                @location,
                GETUTCDATE()
            );

            /**
             * @output {CreatedMovement, 1, 1}
             * @column {INT} idStockMovement
             * - Description: Created movement identifier
             */
            SELECT SCOPE_IDENTITY() AS [idStockMovement];

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO

/**
 * @summary
 * Lists stock movements with filtering options
 * 
 * @procedure spStockMovementList
 * @schema dbo
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount - Account identifier
 * @param {INT} idProduct - Product filter (optional)
 * @param {DATE} startDate - Start date filter (optional)
 * @param {DATE} endDate - End date filter (optional)
 * @param {INT} movementType - Movement type filter (optional)
 * @param {INT} idUser - User filter (optional)
 * @param {INT} page - Page number (default: 1)
 * @param {INT} pageSize - Page size (default: 100)
 * 
 * @testScenarios
 * - List all movements without filters
 * - Filter by product
 * - Filter by date range
 * - Filter by movement type
 * - Filter by user
 * - Pagination
 */
CREATE OR ALTER PROCEDURE [project_1781].[spStockMovementList]
    @idAccount INTEGER,
    @idProduct INTEGER = NULL,
    @startDate DATE = NULL,
    @endDate DATE = NULL,
    @movementType INTEGER = NULL,
    @idUser INTEGER = NULL,
    @page INTEGER = 1,
    @pageSize INTEGER = 100
AS
BEGIN
    SET NOCOUNT ON;

    /**
     * @validation Parameter validation
     */
    IF (@idAccount IS NULL)
    BEGIN
        ;THROW 51000, 'idAccountRequired', 1;
    END;

    IF (@page < 1)
    BEGIN
        SET @page = 1;
    END;

    IF (@pageSize < 10 OR @pageSize > 1000)
    BEGIN
        SET @pageSize = 100;
    END;

    /**
     * @validation Date range validation
     */
    IF (@startDate IS NOT NULL AND @endDate IS NOT NULL AND @endDate < @startDate)
    BEGIN
        ;THROW 51000, 'invalidDateRange', 1;
    END;

    /**
     * @rule {fn-default-date-range} Apply default 30-day range if no dates provided
     */
    IF (@startDate IS NULL AND @endDate IS NULL)
    BEGIN
        SET @endDate = CAST(GETUTCDATE() AS DATE);
        SET @startDate = DATEADD(DAY, -30, @endDate);
    END;

    DECLARE @offset INTEGER = (@page - 1) * @pageSize;

    /**
     * @output {MovementList, n, n}
     * @column {INT} idStockMovement - Movement identifier
     * @column {INT} idProduct - Product identifier
     * @column {INT} idUser - User identifier
     * @column {INT} movementType - Movement type
     * @column {NUMERIC} quantity - Quantity moved
     * @column {NVARCHAR} reason - Movement reason
     * @column {VARCHAR} referenceDocument - Reference document
     * @column {NUMERIC} unitValue - Unit value
     * @column {NVARCHAR} location - Storage location
     * @column {DATETIME2} movementDate - Movement date
     */
    SELECT
        [stcMov].[idStockMovement],
        [stcMov].[idProduct],
        [stcMov].[idUser],
        [stcMov].[movementType],
        [stcMov].[quantity],
        [stcMov].[reason],
        [stcMov].[referenceDocument],
        [stcMov].[unitValue],
        [stcMov].[location],
        [stcMov].[movementDate]
    FROM [project_1781].[stockMovement] [stcMov]
    WHERE [stcMov].[idAccount] = @idAccount
      AND (@idProduct IS NULL OR [stcMov].[idProduct] = @idProduct)
      AND (@startDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) <= @endDate)
      AND (@movementType IS NULL OR [stcMov].[movementType] = @movementType)
      AND (@idUser IS NULL OR [stcMov].[idUser] = @idUser)
    ORDER BY [stcMov].[movementDate] DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;

    /**
     * @output {TotalCount, 1, 1}
     * @column {INT} total - Total count of movements
     */
    SELECT COUNT(*) AS [total]
    FROM [project_1781].[stockMovement] [stcMov]
    WHERE [stcMov].[idAccount] = @idAccount
      AND (@idProduct IS NULL OR [stcMov].[idProduct] = @idProduct)
      AND (@startDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) <= @endDate)
      AND (@movementType IS NULL OR [stcMov].[movementType] = @movementType)
      AND (@idUser IS NULL OR [stcMov].[idUser] = @idUser);
END;
GO

/**
 * @summary
 * Calculates current stock balance for a product
 * 
 * @procedure spStockBalanceGet
 * @schema dbo
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-balance/:idProduct
 * 
 * @parameters
 * @param {INT} idAccount - Account identifier
 * @param {INT} idProduct - Product identifier
 * @param {DATE} referenceDate - Reference date (optional, defaults to current date)
 * 
 * @testScenarios
 * - Calculate current stock balance
 * - Calculate historical stock balance
 * - Calculate average value
 * - Identify last movement
 */
CREATE OR ALTER PROCEDURE [project_1781].[spStockBalanceGet]
    @idAccount INTEGER,
    @idProduct INTEGER,
    @referenceDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    /**
     * @validation Parameter validation
     */
    IF (@idAccount IS NULL)
    BEGIN
        ;THROW 51000, 'idAccountRequired', 1;
    END;

    IF (@idProduct IS NULL)
    BEGIN
        ;THROW 51000, 'idProductRequired', 1;
    END;

    /**
     * @rule {fn-default-reference-date} Use current date if not provided
     */
    IF (@referenceDate IS NULL)
    BEGIN
        SET @referenceDate = CAST(GETUTCDATE() AS DATE);
    END;

    /**
     * @output {StockBalance, 1, n}
     * @column {INT} idProduct - Product identifier
     * @column {NUMERIC} currentBalance - Current stock balance
     * @column {NUMERIC} averageValue - Average unit value
     * @column {DATETIME2} lastMovementDate - Last movement date
     * @column {INT} isOutOfStock - Out of stock indicator (1 if balance <= 0)
     */
    SELECT
        @idProduct AS [idProduct],
        ISNULL(SUM([stcMov].[quantity]), 0) AS [currentBalance],
        CASE
            WHEN SUM(CASE WHEN [stcMov].[unitValue] IS NOT NULL AND [stcMov].[quantity] > 0 THEN [stcMov].[quantity] ELSE 0 END) > 0
            THEN SUM(CASE WHEN [stcMov].[unitValue] IS NOT NULL AND [stcMov].[quantity] > 0 THEN [stcMov].[quantity] * [stcMov].[unitValue] ELSE 0 END) / SUM(CASE WHEN [stcMov].[unitValue] IS NOT NULL AND [stcMov].[quantity] > 0 THEN [stcMov].[quantity] ELSE 0 END)
            ELSE NULL
        END AS [averageValue],
        MAX([stcMov].[movementDate]) AS [lastMovementDate],
        CASE WHEN ISNULL(SUM([stcMov].[quantity]), 0) <= 0 THEN 1 ELSE 0 END AS [isOutOfStock]
    FROM [project_1781].[stockMovement] [stcMov]
    WHERE [stcMov].[idAccount] = @idAccount
      AND [stcMov].[idProduct] = @idProduct
      AND CAST([stcMov].[movementDate] AS DATE) <= @referenceDate;
END;
GO

/**
 * @summary
 * Retrieves movement history for a product with running balance
 * 
 * @procedure spStockMovementHistoryGet
 * @schema dbo
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement/history/:idProduct
 * 
 * @parameters
 * @param {INT} idAccount - Account identifier
 * @param {INT} idProduct - Product identifier
 * @param {DATE} startDate - Start date (optional)
 * @param {DATE} endDate - End date (optional)
 * @param {INT} movementType - Movement type filter (optional)
 * 
 * @testScenarios
 * - Get complete history
 * - Filter by date range
 * - Filter by movement type
 * - Calculate running balance
 */
CREATE OR ALTER PROCEDURE [project_1781].[spStockMovementHistoryGet]
    @idAccount INTEGER,
    @idProduct INTEGER,
    @startDate DATE = NULL,
    @endDate DATE = NULL,
    @movementType INTEGER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    /**
     * @validation Parameter validation
     */
    IF (@idAccount IS NULL)
    BEGIN
        ;THROW 51000, 'idAccountRequired', 1;
    END;

    IF (@idProduct IS NULL)
    BEGIN
        ;THROW 51000, 'idProductRequired', 1;
    END;

    /**
     * @rule {fn-default-date-range} Apply default 30-day range if no dates provided
     */
    IF (@startDate IS NULL AND @endDate IS NULL)
    BEGIN
        SET @endDate = CAST(GETUTCDATE() AS DATE);
        SET @startDate = DATEADD(DAY, -30, @endDate);
    END;

    /**
     * @validation Date range validation
     */
    IF (@startDate IS NOT NULL AND @endDate IS NOT NULL AND @endDate < @startDate)
    BEGIN
        ;THROW 51000, 'invalidDateRange', 1;
    END;

    /**
     * @rule {fn-initial-balance-calculation} Calculate initial balance before period
     */
    DECLARE @initialBalance NUMERIC(15, 2);

    SELECT @initialBalance = ISNULL(SUM([quantity]), 0)
    FROM [project_1781].[stockMovement]
    WHERE [idAccount] = @idAccount
      AND [idProduct] = @idProduct
      AND (@startDate IS NULL OR CAST([movementDate] AS DATE) < @startDate);

    /**
     * @output {InitialBalance, 1, 1}
     * @column {NUMERIC} initialBalance - Balance at start of period
     */
    SELECT @initialBalance AS [initialBalance];

    /**
     * @output {MovementHistory, n, n}
     * @column {INT} idStockMovement - Movement identifier
     * @column {INT} movementType - Movement type
     * @column {NUMERIC} quantity - Quantity moved
     * @column {NVARCHAR} reason - Movement reason
     * @column {VARCHAR} referenceDocument - Reference document
     * @column {NUMERIC} unitValue - Unit value
     * @column {NVARCHAR} location - Storage location
     * @column {DATETIME2} movementDate - Movement date
     * @column {NUMERIC} runningBalance - Running balance after movement
     */
    SELECT
        [stcMov].[idStockMovement],
        [stcMov].[movementType],
        [stcMov].[quantity],
        [stcMov].[reason],
        [stcMov].[referenceDocument],
        [stcMov].[unitValue],
        [stcMov].[location],
        [stcMov].[movementDate],
        @initialBalance + SUM([stcMov].[quantity]) OVER (ORDER BY [stcMov].[movementDate], [stcMov].[idStockMovement]) AS [runningBalance]
    FROM [project_1781].[stockMovement] [stcMov]
    WHERE [stcMov].[idAccount] = @idAccount
      AND [stcMov].[idProduct] = @idProduct
      AND (@startDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST([stcMov].[movementDate] AS DATE) <= @endDate)
      AND (@movementType IS NULL OR [stcMov].[movementType] = @movementType)
    ORDER BY [stcMov].[movementDate] DESC, [stcMov].[idStockMovement] DESC;

    /**
     * @output {FinalBalance, 1, 1}
     * @column {NUMERIC} finalBalance - Balance at end of period
     */
    SELECT
        @initialBalance + ISNULL(SUM([quantity]), 0) AS [finalBalance]
    FROM [project_1781].[stockMovement]
    WHERE [idAccount] = @idAccount
      AND [idProduct] = @idProduct
      AND (@startDate IS NULL OR CAST([movementDate] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST([movementDate] AS DATE) <= @endDate)
      AND (@movementType IS NULL OR [movementType] = @movementType);
END;
GO