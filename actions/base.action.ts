export type ServerActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function createActionResult<T>(data: T): ServerActionResult<T> {
  return { success: true, data };
}

export function createActionError<T = any>(error: string): ServerActionResult<T> {
  return { success: false, error };
}
