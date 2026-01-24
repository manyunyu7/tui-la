import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate<T extends z.ZodType>(
  schema: T,
  target: ValidationTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target])
      req[target] = data
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateBody<T extends z.ZodType>(schema: T) {
  return validate(schema, 'body')
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return validate(schema, 'query')
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return validate(schema, 'params')
}
