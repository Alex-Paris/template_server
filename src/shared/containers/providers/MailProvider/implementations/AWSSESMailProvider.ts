import aws from "aws-sdk";
import nodemailer, { Transporter } from "nodemailer";
import { inject, injectable } from "tsyringe";

import mail from "@config/mail";

import { IMailTemplateProvider } from "../../MailTemplateProvider/models/IMailTemplateProvider";
import { ISendMailDTO } from "../dtos/ISendMailDTO";
import { IMailProvider } from "../models/IMailProvider";

@injectable()
export class AWSSESMailProvider implements IMailProvider {
  private client: Transporter;

  constructor(
    @inject("MailTemplateProvider")
    private mailTemplateProvider: IMailTemplateProvider
  ) {
    this.client = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: "2010-12-01",
        region: mail.config.aws.region,
      }),
    });
  }

  async sendMail({
    to,
    from,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    // Gets default "from" configured.
    const { name, email } = mail.defaults.from;

    // Send mail.
    await this.client.sendMail({
      from: {
        name: from?.name || name,
        address: from?.email || email,
      },
      to: {
        name: to.name,
        address: to.email,
      },
      subject,
      html: await this.mailTemplateProvider.parse(templateData),
    });
  }
}
