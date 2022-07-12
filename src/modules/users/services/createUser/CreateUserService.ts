import { IUsersRepository } from "modules/users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";

import { ICreateUserDTO } from "./CreateUserDTO";
import { CreateUserError } from "./CreateUserError";

@injectable()
export class CreateUserService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: ICreateUserDTO) {
    const checkEmailExists = await this.usersRepository.findByEmail(data.email);

    if (checkEmailExists) {
      throw new CreateUserError();
    }

    const user = await this.usersRepository.create(data);

    return user;
  }
}
