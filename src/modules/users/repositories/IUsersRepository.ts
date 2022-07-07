import { ICreateUserDTO } from "../services/createUser/CreateUserDTO";

export interface IUsersRepository {
  create(data: ICreateUserDTO): Promise<void>;
}
