import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AuthenticateSessionService } from "@modules/users/services/authenticateSession/AuthenticateSessionService";
import { RefreshSessionService } from "@modules/users/services/refreshSession/RefreshSessionService";
import { RevokeSessionService } from "@modules/users/services/revokeSession/RevokeSessionService";

export class SessionController {
  /** Authenticate user session generating a new token and refresh token. */
  async authenticate(req: Request, res: Response): Promise<Response> {
    // Get email and pass in body request to match a created user.
    const { email, password } = req.body;
    // Get remote address for refresh token register.
    const remote_address = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const authenticateService = container.resolve(AuthenticateSessionService);

    const { user, token, refresh_token, refresh_expiration } =
      await authenticateService.execute({
        email,
        password,
        remote_address,
      });

    return (
      res
        // Refresh token go inside a cookie so they are not accessible to
        // client-side javascript which prevents XSS (cross site scripting)
        // attacks.
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          expires: refresh_expiration,
        })
        .json({
          user: instanceToInstance(user),
          token,
        })
    );
  }

  /** Refresh token for user session, generating a new token and refresh token
   * and revoking used one.
   */
  async refresh(req: Request, res: Response): Promise<Response> {
    // Get refresh token cookie.
    const [, refreshToken] = String(req.headers.cookie).split("refresh_token=");
    // Get remote address for refresh token register.
    const remote_address = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const refreshService = container.resolve(RefreshSessionService);

    const { token, refresh_token, refresh_expiration } =
      await refreshService.execute({
        cookie_refresh_token: refreshToken,
        remote_address,
      });

    return (
      res
        // Refresh token go inside a cookie so they are not accessible to
        // client-side javascript which prevents XSS (cross site scripting)
        // attacks. The cookie will be replaced by the new one.
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          expires: refresh_expiration,
        })
        .json({
          token,
        })
    );
  }

  /** Revoke token for user session, making it inactive. */
  async revoke(req: Request, res: Response): Promise<Response> {
    // Get refresh token cookie.
    const [, refreshToken] = String(req.headers.cookie).split("refresh_token=");
    // Get remote address for refresh token register.
    const remote_address = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const revokeService = container.resolve(RevokeSessionService);

    await revokeService.execute({
      cookie_refresh_token: refreshToken,
      remote_address,
    });

    return res.status(200).send();
  }
}
