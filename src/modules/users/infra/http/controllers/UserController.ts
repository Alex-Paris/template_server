import { instanceToInstance } from "class-transformer";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateUserService } from "@modules/users/services/user/create/CreateUserService";
import { UpdateAvatarUserService } from "@modules/users/services/user/updateAvatar/UpdateAvatarUserService";

export class UserController {
  /** Creates a new user. */
  async create(req: Request, res: Response): Promise<Response> {
    // Get name, email and pass in body request to create a user.
    const { name, email, password } = req.body;

    // Injects containers at service and execute it.
    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      name,
      email,
      password,
    });

    return res.status(201).json(instanceToInstance(user));
  }

  /** Updates user avatar. */
  async updateAvatar(req: Request, res: Response): Promise<Response> {
    // Injects containers at service and execute it.
    const updateAvatar = container.resolve(UpdateAvatarUserService);

    const user = await updateAvatar.execute({
      userId: req.user.id,
      avatarFileName: req.file?.filename || "",
    });

    return res.json(instanceToInstance(user));
  }
}
