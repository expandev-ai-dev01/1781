/**
 * @summary
 * Zod validation utilities
 * Provides reusable validation schemas and helpers
 *
 * @module utils/zodValidation
 */

import { z } from 'zod';

export const zString = z.string().min(1);
export const zNullableString = (maxLength?: number) => {
  let schema = z.string();
  if (maxLength) {
    schema = schema.max(maxLength);
  }
  return schema.nullable();
};

export const zName = z.string().min(1).max(200);
export const zNullableDescription = z.string().max(500).nullable();

export const zFK = z.number().int().positive();
export const zNullableFK = z.number().int().positive().nullable();

export const zBit = z.number().int().min(0).max(1);

export const zDateString = z.string().datetime();
export const zNullableDateString = z.string().datetime().nullable();

export const zNumeric = z.number();
export const zNullableNumeric = z.number().nullable();

export const zEmail = z.string().email();
export const zNullableEmail = z.string().email().nullable();
