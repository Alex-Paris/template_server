import { celebrate, Segments, Joi } from "celebrate";
import { Router } from "express";

import { SessionController } from "../controllers/SessionController";

const sessionRouter = Router();

const sessionController = new SessionController();

sessionRouter.post(
  "/",
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  sessionController.authenticate
);

export { sessionRouter };
