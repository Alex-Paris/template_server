import { pgDataSource } from "./data-source";
import { SeedDB } from "./seeds";

pgDataSource
  .initialize()
  .then(async () => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    await SeedDB();
  })
  .catch((error) => console.log(error));
