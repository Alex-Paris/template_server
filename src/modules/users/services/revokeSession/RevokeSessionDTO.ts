import { UserTokens } from "@modules/users/infra/typeorm/entities/UserTokens";

export interface IRevokeTokenDTO {
  userToken: UserTokens;
  ipAddress: string;
  reason: string;
  replacedByToken?: string;
}
