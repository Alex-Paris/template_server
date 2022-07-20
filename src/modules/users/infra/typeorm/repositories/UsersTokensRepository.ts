import { Repository } from "typeorm";

import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";
import { IAuthenticateSessionDTO } from "@modules/users/services/authenticateSession/AuthenticateSessionDTO";
import { IRevokeTokenDTO } from "@modules/users/services/revokeSession/RevokeSessionDTO";

import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { addDays, dateNow, isBefore } from "@utils/date";

import { UserTokens } from "../entities/UserTokens";

export class UsersTokensRepository implements IUsersTokensRepository {
  private repository: Repository<UserTokens>;

  constructor() {
    this.repository = pgDataSource.getRepository(UserTokens);
  }

  async create(data: IAuthenticateSessionDTO): Promise<UserTokens> {
    const userToken = this.repository.create(data);

    await this.repository.save(userToken);

    return userToken;
  }

  async save(userToken: UserTokens): Promise<UserTokens> {
    return this.repository.save(userToken);
  }

  async findById(id: string): Promise<UserTokens | null | undefined> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserIdAndRefreshToken(
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens | undefined | null> {
    return this.repository.findOne({
      where: {
        user_id,
        refresh_token,
      },
    });
  }

  async revokeDescendantRefreshToken({
    userToken,
    ipAddress,
    reason,
    replacedByToken,
  }: IRevokeTokenDTO): Promise<void> {
    let childToken;

    if (userToken.replaced_token_id) {
      childToken = await this.findById(userToken.replaced_token_id);
    }

    if (childToken) {
      this.revokeDescendantRefreshToken({
        userToken: childToken,
        ipAddress,
        reason,
        replacedByToken,
      });
    } else {
      await this.revokeRefreshToken({
        userToken,
        ipAddress,
        reason,
        replacedByToken,
      });
    }
  }

  async revokeRefreshToken({
    userToken,
    ipAddress,
    reason,
    replacedByToken,
  }: IRevokeTokenDTO): Promise<void> {
    const revokedToken = userToken;

    revokedToken.revoked_at = dateNow();
    revokedToken.revoked_by_ip = ipAddress;
    revokedToken.revoked_reason = reason;
    revokedToken.replaced_token_id = replacedByToken;

    await this.save(revokedToken);
  }

  async deleteOldRefreshTokens(user_id: string): Promise<void> {
    const removeUserTokens: UserTokens[] = [];

    const userTokens = await this.repository.find({
      where: {
        user_id,
      },
    });

    userTokens.forEach(async (userToken) => {
      const deleteDate = addDays(userToken.created_at, 10);

      if (!userToken.getIsActive() && isBefore(deleteDate, dateNow())) {
        removeUserTokens.push(userToken);
      }
    });

    this.repository.remove(removeUserTokens);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
