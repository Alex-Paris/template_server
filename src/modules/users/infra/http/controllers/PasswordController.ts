import { Request, Response } from "express";
import { container } from "tsyringe";

import { ForgotPasswordService } from "@modules/users/services/forgotPassword/ForgotPasswordService";
import { ResetPasswordService } from "@modules/users/services/resetPassword/ResetPasswordService";

export class PasswordController {
  /** Send a recover password mail to the requested email, generating a token
   * to validate the reset password.
   */
  async forgot(req: Request, res: Response): Promise<Response> {
    // Get requested email with password was forgotten.
    const { email } = req.body;
    // Get remote address for refresh token register.
    const remoteAddress = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const forgotService = container.resolve(ForgotPasswordService);

    await forgotService.execute({ email, remoteAddress });

    return res.status(204).send();
  }

  /** Reset user's password. */
  async reset(req: Request, res: Response): Promise<Response> {
    // Get requested password and forgotToken forneced to client by forgotPassword service.
    const { password, token: forgotToken } = req.body;
    // Get remote address for forgot token register.
    const remoteAddress = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const resetService = container.resolve(ResetPasswordService);

    await resetService.execute({ password, forgotToken, remoteAddress });

    return res.status(204).send();
  }
}
