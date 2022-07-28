import { v4 as uuidV4 } from "uuid";

import { ICreateUserDTO } from "@modules/users/dtos/ICreateUserDTO";
import { User } from "@modules/users/infra/typeorm/entities/User";

import { IUsersRepository } from "../IUsersRepository";

export class MockUsersRepository implements IUsersRepository {
  private users: User[] = [];

  async create(data: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, { id: uuidV4() }, data);

    this.users.push(user);

    return user;
  }

  async save(user: User): Promise<User> {
    const findIndex = this.users.findIndex(
      (findUser) => findUser.id === user.id
    );

    this.users[findIndex] = user;

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.users.find((user) => user.email === email);
  }
}
