import { v4 as uuidV4 } from "uuid";

import { UserTokens } from "@modules/users/infra/typeorm/entities/UserTokens";
import { IAuthenticateSessionDTO } from "@modules/users/services/authenticateSession/AuthenticateSessionDTO";

import { IUsersTokensRepository } from "../IUsersTokensRepository";

export class MockUsersTokensRepository implements IUsersTokensRepository {
  private userTokens: UserTokens[] = [];

  async create(data: IAuthenticateSessionDTO): Promise<UserTokens> {
    const userToken = new UserTokens();

    Object.assign(userToken, { id: uuidV4() }, data);

    this.userTokens.push(userToken);

    return userToken;
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens | undefined> {
    return this.userTokens.find(
      (userToken) =>
        userToken.id === user_id && userToken.refresh_token === refresh_token
    );
  }

  async deleteById(id: string): Promise<void> {
    this.userTokens = this.userTokens.filter(
      (userToken) => userToken.id !== id
    );
  }
}
