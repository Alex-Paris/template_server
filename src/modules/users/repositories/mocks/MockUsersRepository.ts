import { User } from "@prisma/client";
import { ICreateUserDTO } from "modules/users/services/createUser/CreateUserDTO";
import { v4 as uuidV4 } from "uuid";

import { IUsersRepository } from "../IUsersRepository";

interface IMockUser extends User {
  password: string;
}

export class MockUsersRepository implements IUsersRepository {
  private users: IMockUser[] = [];

  async create(data: ICreateUserDTO): Promise<User> {
    const user: IMockUser = {
      id: uuidV4(),
      avatar: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...data,
    };

    this.users.push(user);

    return user;
  }
}
