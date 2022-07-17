import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Convert date in UTC (removes timezone).
 * @param date date to be converted.
 */
export function convertToUTC(date: Date): string {
  return dayjs(date).utc().local().format();
}

/**
 * Compare if a date is before another. Returns _true_ if compared date is
 * after it.
 * @param date date to check.
 * @param compared_date date to be compared.
 */
export function isBefore(date: Date, compared_date: Date): boolean {
  return dayjs(date).isBefore(compared_date);
}

/**
 * Compare if a date is after another. Returns _true_ if compared date is
 * before it.
 * @param date date to check.
 * @param compared_date date to be compared.
 */
export function isAfter(date: Date, compared_date: Date): boolean {
  return dayjs(date).isAfter(compared_date);
}

/**
 * Compare dates in hours. Returns the amount in number.
 * @param start_date initial date.
 * @param end_date final date.
 */
export function compareInHours(start_date: Date, end_date: Date): number {
  const startDateFormatted = convertToUTC(start_date);
  const endDateFormatted = convertToUTC(end_date);

  return dayjs(endDateFormatted).diff(startDateFormatted, "hours");
}

/**
 * Compare dates in days. Returns the amount in number.
 * @param start_date initial date.
 * @param end_date final date.
 */
export function compareInDays(start_date: Date, end_date: Date): number {
  const startDateFormatted = convertToUTC(start_date);
  const endDateFormatted = convertToUTC(end_date);

  return dayjs(endDateFormatted).diff(startDateFormatted, "days");
}

/**
 * Actual UTC date.
 */
export function dateNow(): Date {
  return dayjs().toDate();
}

/**
 * Add days inside a date.
 * @param date date to have days added.
 * @param amount amount in number of days to add in date.
 */
export function addDays(date: Date, amount: number): Date {
  return dayjs(convertToUTC(date)).add(amount, "days").toDate();
}
