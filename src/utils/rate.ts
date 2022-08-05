import { Response } from "express";

import { addSeconds, dateNow } from "./date";

interface IRateHeader {
  res: Response;
  msBeforeNext: number;
  limitPoints: number;
  remainingPoints: number;
}

/**
 * Fill response header with "X-RateLimit-" values at rate limit route points.
 * @param res to reseive the header values.
 * @param msBeforeNext milliseconds before next reset.
 * @param limitPoints the limited amount of points that can be consumed in rate.
 * @param remainingPoints the amount of points remaining in rate.
 */
export async function fillXRateLimitHeader({
  res,
  msBeforeNext,
  limitPoints,
  remainingPoints,
}: IRateHeader): Promise<void> {
  // Input rate limits in response header.
  const secs = Math.round(msBeforeNext / 1000) || 1;
  res.set("X-RateLimit-Limit", String(limitPoints));
  res.set("X-RateLimit-Remaining", String(remainingPoints));
  res.set("X-RateLimit-Reset", String(addSeconds(dateNow(), secs)));
}

/**
 * Form key for "limiterConsecutiveFailsByEmailAndIP" rate limit in Redis.
 * @param email to reseive the header values.
 * @param ip milliseconds before next reset.
 */
export function getEmailIPkey(email: string, ip: string): string {
  return `${email}_${ip}`;
}
