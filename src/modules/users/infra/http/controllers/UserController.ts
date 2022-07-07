import { Request, Response } from "express";

export class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    console.log("teste");

    return response.status(201).send();
  }
}
