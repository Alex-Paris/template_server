import { UserTokens } from "../infra/typeorm/entities/UserTokens";
import { IAuthenticateSessionDTO } from "../services/authenticateSession/AuthenticateSessionDTO";
import { IRevokeTokenDTO } from "../services/revokeSession/RevokeSessionDTO";

export interface IUsersTokensRepository {
  create(data: IAuthenticateSessionDTO): Promise<UserTokens>;
  save(userToken: UserTokens): Promise<UserTokens>;
  findById(id: string): Promise<UserTokens | undefined | null>;
  findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens | undefined | null>;
  revokeDescendantRefreshToken(data: IRevokeTokenDTO): Promise<void>;
  revokeRefreshToken(data: IRevokeTokenDTO): Promise<void>;
  deleteOldRefreshTokens(user_id: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
