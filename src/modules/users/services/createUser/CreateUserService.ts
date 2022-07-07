import { ICreateUserDTO } from "./CreateUserDTO";

export class CreateUserService {
  async execute(data: ICreateUserDTO) {
    console.log(data);
  }
}
