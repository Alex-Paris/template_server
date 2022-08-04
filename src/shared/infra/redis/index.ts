import { redisDataSource } from "./data-source";

redisDataSource.on("error", (err) => {
  throw new Error(err);
});

redisDataSource
  .connect()
  .then(async () => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Clean db for 'development' env.
    await redisDataSource.flushdb();
  })
  .catch((error) => console.log(error));
