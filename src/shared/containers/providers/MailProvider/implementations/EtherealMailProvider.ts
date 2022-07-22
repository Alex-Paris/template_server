import nodemailer, { Transporter } from "nodemailer";
import { injectable, inject } from "tsyringe";

import { IMailTemplateProvider } from "../../MailTemplateProvider/models/IMailTemplateProvider";
import { ISendMailDTO } from "../dtos/ISendMailDTO";
import { IMailProvider } from "../models/IMailProvider";

@injectable()
export class EtherealMailProvider implements IMailProvider {
  private client: Transporter;

  constructor(
    @inject("MailTemplateProvider")
    private mailTemplateProvider: IMailTemplateProvider
  ) {
    // Create in ethereal an temporary test account for mail sending.
    nodemailer.createTestAccount().then((account) => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      this.client = transporter;
    });
  }

  public async sendMail({
    to,
    from,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    // Create the entirely mail template used to be sended.
    const message = await this.client.sendMail({
      from: {
        name: from?.name || "Template Server Mail Test",
        address: from?.email || "invalid@email.com",
      },
      to: {
        name: to.name,
        address: to.email,
      },
      subject,
      html: await this.mailTemplateProvider.parse(templateData),
      // html: '<p><b>Hello</b> to myself!</p>'
    });

    // Log message with a link to a preview of the email sended.
    console.log("Message sent: %s", message.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
  }
}
