import { IStorageProvider } from "../models/IStorageProvider";

export class MockStorageProvider implements IStorageProvider {
  private storage: string[] = [];

  async saveFile(file: string): Promise<string> {
    this.storage.push(file);

    return file;
  }

  async deleteFile(file: string): Promise<void> {
    const findIndex = this.storage.findIndex((storage) => storage === file);

    this.storage.splice(findIndex, 1);
  }
}
