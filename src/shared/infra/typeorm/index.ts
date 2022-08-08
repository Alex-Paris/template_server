import { databaseSource, queueSource } from "./data-source";
import { SeedDB } from "./seeds";

databaseSource
  .initialize()
  .then(async () => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Repopulate 'development' env because drop schema.
    await SeedDB();
  })
  .catch((error) => console.log(error));

queueSource
  .initialize()
  .then()
  .catch((error) => console.log(error));
