import { add } from "date-fns";
import { sign } from "jsonwebtoken";
import { injectable, inject } from "tsyringe";

import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { IHashProvider } from "@shared/containers/providers/HashProvider/models/IHashProvider";

import { User } from "../../infra/typeorm/entities/User";
import { AuthenticateSessionError } from "./AuthenticateSessionError";

interface IRequestDTO {
  email: string;
  password: string;
  remote_address: string;
}

interface IResponse {
  user: User;
  token: string;
  refresh_token: string;
  refresh_expiration: Date;
}

@injectable()
export class AuthenticateSessionService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository,

    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  public async execute({
    email,
    password,
    remote_address,
  }: IRequestDTO): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticateSessionError.IncorrectEmailOrPasswordError();
    }

    const passwordMatched = await this.hashProvider.compareHash(
      password,
      user.password
    );

    if (!passwordMatched) {
      throw new AuthenticateSessionError.IncorrectEmailOrPasswordError();
    }

    const { secret, expiresIn, refreshSecret, refreshExpiresIn } = auth.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const refresh_token = sign({ email }, refreshSecret, {
      subject: user.id,
      expiresIn: `${refreshExpiresIn}d`,
    });

    const refresh_expiration = add(new Date(), { days: refreshExpiresIn });

    await this.usersTokensRepository.create({
      refresh_token,
      expires_at: refresh_expiration,
      created_by_ip: remote_address,
      user_id: user.id,
    });

    return { user, token, refresh_token, refresh_expiration };
  }
}
