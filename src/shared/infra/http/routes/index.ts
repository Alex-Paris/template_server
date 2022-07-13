import { Router } from "express";

import { usersRouter } from "@modules/users/infra/http/routes/users.routes";

const routes = Router();

routes.use("/user", usersRouter);

export { routes };
