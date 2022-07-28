import { ICreateUserDTO } from "../dtos/ICreateUserDTO";
import { User } from "../infra/typeorm/entities/User";

export interface IUsersRepository {
  /**
   * Create a new user in repository.
   * @param name name of the user.
   * @param email email of the user. Must not exist in repository.
   * @param password password of the user.
   */
  create(data: ICreateUserDTO): Promise<User>;

  /**
   * Save user in repository.
   * @param user user to be saved.
   */
  save(user: User): Promise<User>;

  /**
   * Find a user by email.
   * @param email email of the user.
   */
  findByEmail(email: string): Promise<User | undefined | null>;
}
