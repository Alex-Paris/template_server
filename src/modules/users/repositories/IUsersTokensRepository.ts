import { UserTokens } from "../infra/typeorm/entities/UserTokens";
import { ICreateUserTokenDTO } from "../services/authenticateSession/AuthenticateSessionDTO";

export interface IUsersTokensRepository {
  create(data: ICreateUserTokenDTO): Promise<UserTokens>;
  findByUserIdAndRefreshToken(
    data: ICreateUserTokenDTO
  ): Promise<UserTokens | undefined | null>;
  deleteById(id: string): Promise<void>;
}
