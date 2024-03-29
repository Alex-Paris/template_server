import { ISendMailDTO } from "../dtos/ISendMailDTO";
import { IMailProvider } from "../models/IMailProvider";

export class MockMailProvider implements IMailProvider {
  private messages: ISendMailDTO[] = [];

  async sendMail(message: ISendMailDTO): Promise<void> {
    this.messages.push(message);
  }
}
