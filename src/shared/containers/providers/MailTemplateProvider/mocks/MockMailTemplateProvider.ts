import { IMailTemplateProvider } from "../models/IMailTemplateProvider";

export class MockMailTemplateProvider implements IMailTemplateProvider {
  public async parse(): Promise<string> {
    return "Mail content";
  }
}
