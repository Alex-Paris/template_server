import fs from "fs";
import handlebars from "handlebars";

import { IParseMailTemplateDTO } from "../dtos/IParseMailTemplateDTO";
import { IMailTemplateProvider } from "../models/IMailTemplateProvider";

export class HandlebarsMailTemplateProvider implements IMailTemplateProvider {
  public async parse({
    file,
    variables,
  }: IParseMailTemplateDTO): Promise<string> {
    // Get file template for mail.
    const templateFileContent = await fs.promises.readFile(file, {
      encoding: "utf-8",
    });

    // Handle file to compile the template.
    const parseTemplate = handlebars.compile(templateFileContent);

    // Put variables inside template.
    return parseTemplate(variables);
  }
}
