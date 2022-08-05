import { inject, injectable } from "tsyringe";

import { User } from "@modules/users/infra/typeorm/entities/User";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";

import { IStorageProvider } from "@shared/containers/providers/StorageProvider/models/IStorageProvider";

import { UpdateAvatarUserError } from "./UpdateAvatarUserError";

interface IRequestDTO {
  userId: string;
  avatarFileName: string;
}

@injectable()
export class UpdateAvatarUserService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StorageProvider")
    private storageProvider: IStorageProvider
  ) {}

  /**
   * Upload avatar for user.
   * @param name name of the user.
   * @param email email of the user. Must not exist in repository.
   * @param password password of the user.
   */
  async execute({ userId, avatarFileName }: IRequestDTO): Promise<User> {
    // Get authenticated user in repository.
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UpdateAvatarUserError.NotAuthenticatedUser();
    }

    // Delete old avatar.
    if (user.avatar) {
      await this.storageProvider.deleteFile(user.avatar);
    }

    // Save the new avatar in storage and get his new name.
    const fileName = await this.storageProvider.saveFile(avatarFileName);

    // Update avatar file name inside user.
    user.avatar = fileName;

    await this.usersRepository.save(user);

    return user;
  }
}
