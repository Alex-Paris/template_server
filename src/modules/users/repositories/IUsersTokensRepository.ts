import { ICreateTokenDTO } from "../dtos/ICreateTokenDTO";
import { IRevokeTokenDTO } from "../dtos/IRevokeTokenDTO";
import { UserTokens } from "../infra/typeorm/entities/UserTokens";

export interface IUsersTokensRepository {
  /**
   * Create a new refresh token for user.
   * @param refreshToken token generated by JWT.
   * @param expiresAt expiration date for valid token.
   * @param createdByIp ip to identify wheres refresh token was requested.
   * @param userId user identification who requested the token.
   */
  create(data: ICreateTokenDTO): Promise<UserTokens>;

  /**
   * Save refresh token for user.
   * @param userToken refresh token to be saved.
   */
  save(userToken: UserTokens): Promise<UserTokens>;

  /**
   * Find a refresh token by it's id.
   * @param id refresh token id.
   */
  findById(id: string): Promise<UserTokens | undefined | null>;

  /**
   * Find a refresh token by it's user and token.
   * @param userId user id related to the refresh token.
   * @param refreshToken refresh token JWT.
   */
  findByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<UserTokens | undefined | null>;

  /**
   * Revoke the last descendant refresh token generated by a specific user and
   * ip address. This will enter a loop until find the last one and send to the
   * 'revokeRefreshToken' to be revoked and inactive.
   * @param userToken refresh token to be revoked.
   * @param ipAddress ip address related from all refresh tokens user's.
   * @param reason explaining why refresh token was revoked. _(Default: "")_ .
   * @param replacedByToken new refresh token id created who will revoke the
   * old one.
   */
  revokeDescendantRefreshToken(data: IRevokeTokenDTO): Promise<void>;

  /**
   * Revoke refresh token generated by a specific user. This will result in
   * inactivity of the token.
   * @param userToken refresh token to be revoked.
   * @param ipAddress ip address related from refresh token user's.
   * @param reason explaining why refresh token was revoked. _(Default: "")_ .
   * @param replacedByToken new refresh token id created who will revoke the
   * old one. _(Default: "")_
   */
  revokeRefreshToken(data: IRevokeTokenDTO): Promise<void>;

  /**
   * Delete all old refresh tokens generated by a specific user. The filter is
   * the expiration date more the time to live (in days) defined on JWT config.
   * @param userId user id related to the old refresh tokens.
   */
  deleteOldRefreshTokens(user_id: string): Promise<void>;

  /**
   * Delete a refresh token by it's id.
   * @param id refresh token id.
   */
  deleteById(id: string): Promise<void>;
}
