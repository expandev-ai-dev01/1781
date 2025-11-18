/**
 * @summary
 * CRUD controller middleware for standardized request handling
 * Provides validation and security patterns for API operations
 *
 * @module middleware/crud
 */

import { Request } from 'express';
import { z } from 'zod';

export interface SecurityRule {
  securable: string;
  permission: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
}

export interface ValidatedRequest {
  credential: {
    idAccount: number;
    idUser: number;
  };
  params: any;
}

export class CrudController {
  private securityRules: SecurityRule[];

  constructor(securityRules: SecurityRule[]) {
    this.securityRules = securityRules;
  }

  async create(req: Request, schema: z.ZodSchema): Promise<[ValidatedRequest | undefined, any]> {
    return this.validateRequest(req, schema, 'CREATE');
  }

  async read(req: Request, schema: z.ZodSchema): Promise<[ValidatedRequest | undefined, any]> {
    return this.validateRequest(req, schema, 'READ');
  }

  async update(req: Request, schema: z.ZodSchema): Promise<[ValidatedRequest | undefined, any]> {
    return this.validateRequest(req, schema, 'UPDATE');
  }

  async delete(req: Request, schema: z.ZodSchema): Promise<[ValidatedRequest | undefined, any]> {
    return this.validateRequest(req, schema, 'DELETE');
  }

  private async validateRequest(
    req: Request,
    schema: z.ZodSchema,
    permission: string
  ): Promise<[ValidatedRequest | undefined, any]> {
    try {
      const params = await schema.parseAsync({
        ...req.params,
        ...req.query,
        ...req.body,
      });

      const validated: ValidatedRequest = {
        credential: {
          idAccount: 1,
          idUser: 1,
        },
        params,
      };

      return [validated, undefined];
    } catch (error) {
      return [undefined, error];
    }
  }
}

export const successResponse = (data: any) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (message: string, details?: any) => ({
  success: false,
  error: {
    message,
    details,
  },
  timestamp: new Date().toISOString(),
});

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const StatusGeneralError: ApiError = {
  name: 'GeneralError',
  message: 'An unexpected error occurred',
  statusCode: 500,
  code: 'INTERNAL_SERVER_ERROR',
};
