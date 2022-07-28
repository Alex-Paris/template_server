import { Repository } from "typeorm";

import { ICreateUserDTO } from "@modules/users/dtos/ICreateUserDTO";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";

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

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.repository.findOne({ where: { email } });
  }
}
