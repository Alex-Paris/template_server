import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AuthenticateSessionService } from "@modules/users/services/authenticateSession/AuthenticateSessionService";

export class SessionController {
  async authenticate(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;

    const authenticateUser = container.resolve(AuthenticateSessionService);

    const { user, token, refresh_token } = await authenticateUser.execute({
      email,
      password,
    });

    return response.json({
      user: instanceToInstance(user),
      token,
      refresh_token,
    });
  }
}
