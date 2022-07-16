import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AuthenticateSessionService } from "@modules/users/services/authenticateSession/AuthenticateSessionService";

export class SessionController {
  async authenticate(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const remote_address = request.socket.remoteAddress || "";

    const authenticateUser = container.resolve(AuthenticateSessionService);

    const { user, token, refresh_token, refresh_expiration } =
      await authenticateUser.execute({
        email,
        password,
        remote_address,
      });

    return response
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        expires: refresh_expiration,
      })
      .json({
        user: instanceToInstance(user),
        token,
      });
  }
}
