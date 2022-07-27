import { EType } from "../infra/typeorm/entities/UserTokens";

export interface ICreateTokenDTO {
  refreshToken: string;
  type: EType;
  expiresAt: Date;
  createdByIp: string;
  userId: string;
}
