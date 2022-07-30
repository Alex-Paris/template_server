import { redisDataSource } from "./data-source";

redisDataSource.on("error", (err) => {
  throw new Error(err);
});

redisDataSource
  .connect()
  .then()
  .catch((error) => console.log(error));
