import { celebrate, Joi, Segments } from "celebrate";
import { Router } from "express";
import multer from "multer";

import upload from "@config/upload";

import { UserController } from "../controllers/UserController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const userRouter = Router();
const userController = new UserController();

const uploadMulter = multer(upload.multer);

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

userRouter.patch(
  "/avatar",
  ensureAuthenticated,
  uploadMulter.single("avatar"),
  userController.updateAvatar
);

export { userRouter };
