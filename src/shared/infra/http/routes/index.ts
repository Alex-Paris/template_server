import { Router } from "express";

import { passwordRouter } from "@modules/users/infra/http/routes/password.routes";
import { sessionRouter } from "@modules/users/infra/http/routes/session.routes";
import { userRouter } from "@modules/users/infra/http/routes/user.routes";

const routes = Router();

routes.use("/password", passwordRouter);
routes.use("/session", sessionRouter);
routes.use("/user", userRouter);

export { routes };
