import { User } from "../infra/typeorm/entities/User";
import { ICreateUserDTO } from "../services/createUser/CreateUserDTO";

export interface IUsersRepository {
  /**
   * Create a new user in repository.
   * @param name name of the user.
   * @param email email of the user. Must not exist in repository.
   * @param password password of the user.
   */
  create(data: ICreateUserDTO): Promise<User>;

  /**
   * Find a user by email.
   * @param email email of the user.
   */
  findByEmail(email: string): Promise<User | undefined | null>;
}
