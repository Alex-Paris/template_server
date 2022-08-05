/* eslint-disable no-await-in-loop */
import { hash } from "bcryptjs";
import { Repository } from "typeorm";

import { User } from "@modules/users/infra/typeorm/entities/User";

import { pgDataSource } from "../data-source";

export async function SeedUsers(): Promise<void> {
  const repository: Repository<User> = pgDataSource.getRepository(User);

  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < 10; index++) {
    const user = repository.create({
      name: `Sample Name ${index}`,
      email: `name${index}@sample.com`,
      password: await hash(`samplepass${index}`, 8),
    });

    await repository.save(user);
  }

  console.log("Seed Users created!");
}
