import { EType } from "../infra/typeorm/entities/UserTokens";

export interface ICreateTokenDTO {
  refresh_token: string;
  type: EType;
  expires_at: Date;
  created_by_ip: string;
  user_id: string;
}
