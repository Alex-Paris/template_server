import { SeedUsers } from "./users";

export async function SeedDB(): Promise<void> {
  await SeedUsers();
}
