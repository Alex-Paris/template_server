import { celebrate, Joi, Segments } from "celebrate";
import { Router } from "express";

import { UserController } from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

userRouter.post(
  "/",
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  userController.create
);

export { userRouter };
