import { ISendMailDTO } from "../dtos/ISendMailDTO";

export interface IMailProvider {
  /**
   * Send email.
   * @param to mail contact object with name and email.
   * @param from mail contact object with name and email.
   * @param subject mail subject.
   * @param templateData template of email body.
   */
  sendMail(data: ISendMailDTO): Promise<void>;
}
