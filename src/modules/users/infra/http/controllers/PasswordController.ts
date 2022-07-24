import { Request, Response } from "express";
import { container } from "tsyringe";

import { ForgotPasswordService } from "@modules/users/services/forgotPassword/ForgotPasswordService";

export class PasswordController {
  /** Send a recover password mail to the requested email, generating a token
   * to validate the reset password.
   */
  async forgot(req: Request, res: Response): Promise<Response> {
    // Get requested email with password was forgotten.
    const { email } = req.body;
    // Get remote address for refresh token register.
    const remote_address = req.socket.remoteAddress as string;

    // Injects containers at service and execute it.
    const forgotService = container.resolve(ForgotPasswordService);

    await forgotService.execute({ email, remote_address });

    return res.status(204).send();
  }
}
