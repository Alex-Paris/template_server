import { v4 as uuidV4 } from "uuid";

import { UserTokens } from "@modules/users/infra/typeorm/entities/UserTokens";
import { IAuthenticateSessionDTO } from "@modules/users/services/authenticateSession/AuthenticateSessionDTO";
import { IRevokeTokenDTO } from "@modules/users/services/revokeSession/RevokeSessionDTO";

import { addDays, dateNow, isBefore } from "@utils/date";

import { IUsersTokensRepository } from "../IUsersTokensRepository";

export class MockUsersTokensRepository implements IUsersTokensRepository {
  private userTokens: UserTokens[] = [];

  async create(data: IAuthenticateSessionDTO): Promise<UserTokens> {
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
    user_id: string,
    refresh_token: string
  ): Promise<UserTokens | undefined> {
    return this.userTokens.find(
      (userToken) =>
        userToken.user_id === user_id &&
        userToken.refresh_token === refresh_token
    );
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

    revokedToken.revoked_at = new Date();
    revokedToken.revoked_by_ip = ipAddress;
    revokedToken.revoked_reason = reason;
    revokedToken.replaced_token_id = replacedByToken;

    await this.save(revokedToken);
  }

  async deleteOldRefreshTokens(user_id: string): Promise<void> {
    const userTokens = this.userTokens.filter(
      (findToken) => findToken.user_id === user_id
    );

    userTokens.forEach(async (userToken) => {
      const deleteDate = addDays(userToken.created_at, 10);

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
