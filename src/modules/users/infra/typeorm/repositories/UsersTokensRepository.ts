import { Repository } from "typeorm";

import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";
import { ICreateUserTokenDTO } from "@modules/users/services/authenticateSession/AuthenticateSessionDTO";

import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { UserTokens } from "../entities/UserTokens";

export class UsersTokensRepository implements IUsersTokensRepository {
  private repository: Repository<UserTokens>;

  constructor() {
    this.repository = pgDataSource.getRepository(UserTokens);
  }

  async create(data: ICreateUserTokenDTO): Promise<UserTokens> {
    const userToken = this.repository.create(data);

    await this.repository.save(userToken);

    return userToken;
  }

  async findByUserIdAndRefreshToken({
    user_id,
    refresh_token,
  }: ICreateUserTokenDTO): Promise<UserTokens | undefined | null> {
    return this.repository.findOne({
      where: {
        user_id,
        refresh_token,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
