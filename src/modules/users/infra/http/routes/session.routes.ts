import { celebrate, Segments, Joi } from "celebrate";
import { Router } from "express";

import { SessionController } from "../controllers/SessionController";
import { rateLimitSession } from "../middlewares/rateLimitSession";

const sessionRouter = Router();
const sessionController = new SessionController();

sessionRouter.post(
  "/authenticate",
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  rateLimitSession,
  sessionController.authenticate
);

sessionRouter.post("/refresh-token", sessionController.refresh);

sessionRouter.post("/revoke-token", sessionController.revoke);

export { sessionRouter };
