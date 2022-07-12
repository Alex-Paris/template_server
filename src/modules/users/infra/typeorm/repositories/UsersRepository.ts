import { Repository } from "typeorm";

import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { ICreateUserDTO } from "@modules/users/services/createUser/CreateUserDTO";

import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { User } from "../entities/User";

export class UsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = pgDataSource.getRepository(User);
  }

  async create(userData: ICreateUserDTO): Promise<User> {
    const user = this.repository.create(userData);

    await this.repository.save(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.repository.findOne({ where: { email } });
  }
}
