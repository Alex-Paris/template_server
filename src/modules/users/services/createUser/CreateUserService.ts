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

  async execute({ name, email, password }: ICreateUserDTO) {
    const checkEmailExists = await this.usersRepository.findByEmail(email);

    if (checkEmailExists) {
      throw new CreateUserError();
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }
}
