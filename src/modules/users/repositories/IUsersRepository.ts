import { User } from "../infra/typeorm/entities/User";
import { ICreateUserDTO } from "../services/createUser/CreateUserDTO";

export interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<User>;
}
