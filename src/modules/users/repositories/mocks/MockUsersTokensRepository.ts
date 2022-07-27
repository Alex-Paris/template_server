import { v4 as uuidV4 } from "uuid";

import { ICreateTokenDTO } from "@modules/users/dtos/ICreateTokenDTO";
import { IRevokeTokenDTO } from "@modules/users/dtos/IRevokeTokenDTO";
import { UserTokens } from "@modules/users/infra/typeorm/entities/UserTokens";

import { addDays, dateNow, isBefore } from "@utils/date";

import { IUsersTokensRepository } from "../IUsersTokensRepository";

export class MockUsersTokensRepository implements IUsersTokensRepository {
  private userTokens: UserTokens[] = [];

  async create(data: ICreateTokenDTO): Promise<UserTokens> {
    const userToken = new UserTokens();

    Object.assign(userToken, { id: uuidV4() }, data);

    this.userTokens.push(userToken);

    return userToken;
  }

  async save(userToken: UserTokens): Promise<UserTokens> {
    const findIndex = this.userTokens.findIndex(
      (findToken) => findToken.id === userToken.id
    );

    this.userTokens[findIndex] = userToken;

    return userToken;
  }

  async findById(id: string): Promise<UserTokens | null | undefined> {
    return this.userTokens.find((findToken) => findToken.id === id);
  }

  async findByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<UserTokens | undefined> {
    return this.userTokens.find(
      (userToken) =>
        userToken.userId === userId && userToken.refreshToken === refreshToken
    );
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
      this.revokeRefreshToken({
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

    revokedToken.revokedAt = new Date();
    revokedToken.revokedByIp = ipAddress;
    revokedToken.revokedReason = reason;
    revokedToken.replacedTokenId = replacedByToken;

    await this.save(revokedToken);
  }

  async deleteOldRefreshTokens(userId: string): Promise<void> {
    const userTokens = this.userTokens.filter(
      (findToken) => findToken.userId === userId
    );

    userTokens.forEach(async (userToken) => {
      const deleteDate = addDays(userToken.createdAt, 10);

      if (!userToken.getIsActive() && isBefore(deleteDate, dateNow())) {
        this.deleteById(userToken.id);
      }
    });
  }

  async deleteById(id: string): Promise<void> {
    this.userTokens = this.userTokens.filter(
      (userToken) => userToken.id !== id
    );
  }
}
