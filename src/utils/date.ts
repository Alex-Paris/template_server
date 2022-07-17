import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function convertToUTC(date: Date): string {
  return dayjs(date).utc().local().format();
}

export function isBefore(date: Date, compared_date: Date): boolean {
  return dayjs(date).isBefore(compared_date);
}

export function isAfter(date: Date, compared_date: Date): boolean {
  return dayjs(date).isAfter(compared_date);
}

export function compareInHours(start_date: Date, end_date: Date): number {
  const startDateFormatted = convertToUTC(start_date);
  const endDateFormatted = convertToUTC(end_date);

  return dayjs(endDateFormatted).diff(startDateFormatted, "hours");
}

export function compareInDays(start_date: Date, end_date: Date): number {
  const startDateFormatted = convertToUTC(start_date);
  const endDateFormatted = convertToUTC(end_date);

  return dayjs(endDateFormatted).diff(startDateFormatted, "days");
}

export function dateNow(): Date {
  return dayjs().toDate();
}

export function addDays(date: Date, amount: number): Date {
  return dayjs(convertToUTC(date)).add(amount, "days").toDate();
}
