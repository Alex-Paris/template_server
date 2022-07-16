import { UserTokens } from "../infra/typeorm/entities/UserTokens";
import { IAuthenticateSessionDTO } from "../services/authenticateSession/AuthenticateSessionDTO";

export interface IUsersTokensRepository {
  create(data: IAuthenticateSessionDTO): Promise<UserTokens>;
  findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens | undefined | null>;
  deleteById(id: string): Promise<void>;
}
