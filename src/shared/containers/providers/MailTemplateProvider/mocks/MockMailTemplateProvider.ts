import { IMailTemplateProvider } from "../models/IMailTemplateProvider";

export class MockMailTemplateProvider implements IMailTemplateProvider {
  async parse(): Promise<string> {
    return "Mail content";
  }
}
