interface ILimiterError {
  msBeforeNext: number;
  limitPoints: number;
  remainingPoints: number;
}

export class LimiterError {
  public readonly secsBeforeNext: number;

  public readonly msBeforeNext: number;

  public readonly limitPoints: number;

  public readonly remainingPoints: number;

  constructor({ msBeforeNext, limitPoints, remainingPoints }: ILimiterError) {
    this.secsBeforeNext = Math.round(msBeforeNext / 1000) || 1;
    this.msBeforeNext = msBeforeNext;
    this.limitPoints = limitPoints;
    this.remainingPoints = remainingPoints;
  }
}
