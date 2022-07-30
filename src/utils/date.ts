import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Convert date in UTC (removes timezone).
 * @param date date to be converted.
 */
export function convertToUTC(date: Date): string {
  return dayjs(date).utc().format();
}

/**
 * Convert date in local time (with local timezone).
 * @param date date to be converted.
 */
export function convertToLocal(date: Date): string {
  return dayjs(date).utc().local().format();
}

/**
 * Compare if a date is before another. Returns _true_ if compared date is
 * after it.
 * @param date date to check.
 * @param comparedDate date to be compared.
 */
export function isBefore(date: Date, comparedDate: Date): boolean {
  return dayjs(date).isBefore(comparedDate);
}

/**
 * Compare if a date is after another. Returns _true_ if compared date is
 * before it.
 * @param date date to check.
 * @param comparedDate date to be compared.
 */
export function isAfter(date: Date, comparedDate: Date): boolean {
  return dayjs(date).isAfter(comparedDate);
}

/**
 * Compare dates in hours. Returns the amount in number.
 * @param startDate initial date.
 * @param endDate final date.
 */
export function compareInHours(startDate: Date, endDate: Date): number {
  const startDateFormatted = convertToUTC(startDate);
  const endDateFormatted = convertToUTC(endDate);

  return dayjs(endDateFormatted).diff(startDateFormatted, "hours");
}

/**
 * Compare dates in days. Returns the amount in number.
 * @param startDate initial date.
 * @param endDate final date.
 */
export function compareInDays(startDate: Date, endDate: Date): number {
  const startDateFormatted = convertToUTC(startDate);
  const endDateFormatted = convertToUTC(endDate);

  return dayjs(endDateFormatted).diff(startDateFormatted, "days");
}

/**
 * Actual UTC date.
 */
export function dateNow(): Date {
  return dayjs().toDate();
}

/**
 * Add seconds inside a date.
 * @param date date to have seconds added.
 * @param amount amount in number of seconds to add in date.
 */
export function addSeconds(date: Date, amount: number): Date {
  return dayjs(convertToUTC(date)).add(amount, "seconds").toDate();
}

/**
 * Add hours inside a date.
 * @param date date to have hours added.
 * @param amount amount in number of hours to add in date.
 */
export function addHours(date: Date, amount: number): Date {
  return dayjs(convertToUTC(date)).add(amount, "hours").toDate();
}

/**
 * Add days inside a date.
 * @param date date to have days added.
 * @param amount amount in number of days to add in date.
 */
export function addDays(date: Date, amount: number): Date {
  return dayjs(convertToUTC(date)).add(amount, "days").toDate();
}
