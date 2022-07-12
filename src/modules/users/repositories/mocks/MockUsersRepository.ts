import { v4 as uuidV4 } from "uuid";

import { User } from "@modules/users/infra/typeorm/entities/User";
import { ICreateUserDTO } from "@modules/users/services/createUser/CreateUserDTO";

import { IUsersRepository } from "../IUsersRepository";

export class MockUsersRepository implements IUsersRepository {
  private users: User[] = [];

  async create(data: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, { id: uuidV4() }, data);

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.users.find((user) => user.email === email);
  }
}
