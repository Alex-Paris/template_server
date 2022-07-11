import { User } from "modules/users/infra/typeorm/entities/User";
import { ICreateUserDTO } from "modules/users/services/createUser/CreateUserDTO";
import { v4 as uuidV4 } from "uuid";

import { IUsersRepository } from "../IUsersRepository";

interface IMockUser extends User {
  password: string;
}

export class MockUsersRepository implements IUsersRepository {
  private users: IMockUser[] = [];

  async create(data: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, { id: uuidV4() }, data);

    this.users.push(user);

    return user;
  }
}
