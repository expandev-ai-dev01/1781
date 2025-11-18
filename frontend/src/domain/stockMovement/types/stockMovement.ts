export enum StockMovementType {
  NewProduct = 0,
  Entry = 1,
  Exit = 2,
  Adjustment = 3,
  Deletion = 4,
}

export interface StockMovement {
  idStockMovement: number;
  idProduct: number;
  productName?: string;
  movementType: StockMovementType;
  quantity: number;
  reason: string;
  referenceDocument?: string | null;
  unitValue?: number | null;
  location?: string | null;
  idUser: number;
  userName?: string;
  movementDate: string;
  runningBalance?: number;
}

export interface CreateStockMovementDto {
  idProduct: number;
  movementType: StockMovementType;
  quantity: number;
  reason: string;
  referenceDocument?: string | null;
  unitValue?: number | null;
  location?: string | null;
}

export interface StockMovementListParams {
  idProduct?: number;
  startDate?: string;
  endDate?: string;
  movementType?: StockMovementType;
  idUser?: number;
  page?: number;
  pageSize?: number;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  total: number;
}

export interface StockBalance {
  idProduct: number;
  currentBalance: number;
  averageValue: number | null;
  lastMovementDate: string | null;
  isOutOfStock: boolean;
}

export interface StockMovementHistoryParams {
  idProduct: number;
  startDate?: string;
  endDate?: string;
  movementType?: StockMovementType;
}

export interface StockMovementHistory {
  initialBalance: number;
  movements: StockMovement[];
  finalBalance: number;
}
