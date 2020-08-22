export type CommonRes<T = any> = Promise<{
  // default 0
  code?: Code
  message?: string
  data: T
}>

/**
 * 500: server error;
 * 1000: empty value not exception;
 * 2000: no data in table exception;
 * 3000: data has relation, cannot be delete
 * 3100: duplicate data in table
 */
export type Code = 500 | 1000 | 2000 | 3000 | 3100
