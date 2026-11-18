import { Prisma } from "@/generated/prisma/client";

/**
 * Database decimals become numbers (they would reach the client as strings), so what the contract
 * calls a number is one. Dates and other class instances are left for JSON to write.
 */
export function withNumbers(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) return value.toNumber();
  if (Array.isArray(value)) return value.map(withNumbers);
  if (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  )
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, withNumbers(item)]),
    );
  return value;
}
