import { SeedUsers } from "./users";

export async function SeedDB() {
  await SeedUsers();
}
