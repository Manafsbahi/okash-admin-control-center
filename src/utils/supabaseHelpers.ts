
import { PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * Type guard to check if a response contains data
 */
export function hasData<T>(
  response: PostgrestSingleResponse<T> | null | undefined
): response is PostgrestSingleResponse<T> & { data: NonNullable<T> } {
  return !!response && !response.error && response.data !== null;
}

/**
 * Safely access data from Supabase response, with type narrowing
 */
export function safeData<T, K>(
  response: PostgrestSingleResponse<T> | null | undefined,
  defaultValue: K
): NonNullable<T> | K {
  if (hasData(response)) {
    return response.data;
  }
  return defaultValue;
}

/**
 * Cast database ID parameters to string, to handle TypeScript type checking
 */
export const asId = (id: string): any => id;

/**
 * Use this to cast objects to the correct type for database updates
 */
export const asUpdatePayload = <T>(payload: T): any => payload;
