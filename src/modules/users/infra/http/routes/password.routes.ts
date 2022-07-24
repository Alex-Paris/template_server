import { celebrate, Segments, Joi } from "celebrate";
import { Router } from "express";

import { PasswordController } from "../controllers/PasswordController";

const passwordRouter = Router();
const passwordController = new PasswordController();

passwordRouter.post(
  "/forgot",
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  passwordController.forgot
);

export { passwordRouter };
