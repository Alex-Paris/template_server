import { Router } from "express";

import { sessionRouter } from "@modules/users/infra/http/routes/session.routes";
import { userRouter } from "@modules/users/infra/http/routes/user.routes";

const routes = Router();

routes.use("/session", sessionRouter);
routes.use("/user", userRouter);

export { routes };
