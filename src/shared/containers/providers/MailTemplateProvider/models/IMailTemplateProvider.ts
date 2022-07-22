import { IParseMailTemplateDTO } from "../dtos/IParseMailTemplateDTO";

export interface IMailTemplateProvider {
  /**
   * Parse template file for mail provider.
   * @param file path to the template file for email.
   * @param variables variables to be used inside email template.
   */
  parse(data: IParseMailTemplateDTO): Promise<string>;
}
