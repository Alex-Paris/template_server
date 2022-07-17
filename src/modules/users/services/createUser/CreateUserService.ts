import { IUsersRepository } from "modules/users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";

import { IHashProvider } from "@shared/containers/providers/HashProvider/models/IHashProvider";

import { ICreateUserDTO } from "./CreateUserDTO";
import { CreateUserError } from "./CreateUserError";

@injectable()
export class CreateUserService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  /**
   * Create user service.
   * @param name name of the user.
   * @param email email of the user. Must not exist in repository.
   * @param password password of the user.
   */
  async execute({ name, email, password }: ICreateUserDTO) {
    // Validating if the forneced email isn't already in repository.
    const checkEmailExists = await this.usersRepository.findByEmail(email);

    if (checkEmailExists) {
      throw new CreateUserError.EmailAlreadyUsed();
    }

    // Generate a hashed password to save.
    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }
}
