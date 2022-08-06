import { container } from "tsyringe";

import mailConfig from "@config/mail";

import { AWSSESMailProvider } from "./implementations/AWSSESMailProvider";
import { EtherealMailProvider } from "./implementations/EtherealMailProvider";
import { IMailProvider } from "./models/IMailProvider";

const providers = {
  ethereal: container.resolve(EtherealMailProvider),
  awsSES: container.resolve(AWSSESMailProvider),
};

container.registerInstance<IMailProvider>(
  "MailProvider",
  providers[mailConfig.driver]
);
