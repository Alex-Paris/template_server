import fs from "fs";
import path from "path";

import upload from "@config/upload";

import { IStorageProvider } from "../models/IStorageProvider";

export class DiskStorageProvider implements IStorageProvider {
  async saveFile(file: string): Promise<string> {
    // File already been saved by muter in "tmp" folder by a middleware of
    // route. This method only move file.
    await fs.promises.rename(
      path.resolve(upload.tmpFolder, file),
      path.resolve(upload.uploadsFolder, file)
    );

    return file;
  }

  async deleteFile(file: string): Promise<void> {
    // Gets the file path.
    const filePath = path.resolve(upload.uploadsFolder, file);

    // Verify if this path returns a valid file.
    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    // If is valid, delete the file.
    await fs.promises.unlink(filePath);
  }
}
