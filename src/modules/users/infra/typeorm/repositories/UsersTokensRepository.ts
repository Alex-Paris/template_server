import { Repository } from "typeorm";

import { ICreateTokenDTO } from "@modules/users/dtos/ICreateTokenDTO";
import { IRevokeTokenDTO } from "@modules/users/dtos/IRevokeTokenDTO";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import { databaseSource } from "@shared/infra/typeorm/data-source";

import { addDays, dateNow, isBefore } from "@utils/date";

import { UserTokens } from "../entities/UserTokens";

export class UsersTokensRepository implements IUsersTokensRepository {
  private repository: Repository<UserTokens>;

  constructor() {
    this.repository = databaseSource.getRepository(UserTokens);
  }

  async create(data: ICreateTokenDTO): Promise<UserTokens> {
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
    userId: string,
    refreshToken: string
  ): Promise<UserTokens | undefined | null> {
    return this.repository.findOne({
      where: {
        userId,
        refreshToken,
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

    if (userToken.replacedTokenId) {
      childToken = await this.findById(userToken.replacedTokenId);
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

    revokedToken.revokedAt = dateNow();
    revokedToken.revokedByIp = ipAddress;
    revokedToken.revokedReason = reason;
    revokedToken.replacedTokenId = replacedByToken;

    await this.save(revokedToken);
  }

  async deleteOldRefreshTokens(userId: string): Promise<void> {
    const removeUserTokens: UserTokens[] = [];

    const userTokens = await this.repository.find({
      where: {
        userId,
      },
    });

    userTokens.forEach(async (userToken) => {
      const deleteDate = addDays(userToken.createdAt, 10);

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
