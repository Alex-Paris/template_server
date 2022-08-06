import aws, { S3 } from "aws-sdk";
import fs from "fs";
import mime from "mime";
import path from "path";

import upload from "@config/upload";

import { IStorageProvider } from "../models/IStorageProvider";

export class AWSS3StorageProvider implements IStorageProvider {
  private client: S3;

  constructor() {
    this.client = new aws.S3({
      apiVersion: "2006-03-01",
      region: upload.config.aws.region,
    });
  }

  async saveFile(file: string): Promise<string> {
    // File already been saved by muter in "tmp" folder by a middleware of
    // route.
    // Get the path of the file in this "tmp" folder who wants to be sended.
    const originalPath = path.resolve(upload.tmpFolder, file);

    // Get file type and some more information about it.
    const ContentType = mime.getType(originalPath) || "";

    // Get the file content.
    const fileContent = await fs.promises.readFile(originalPath);

    // Send file and its information to the bucket. ACL is "public-read", so the
    // client will not need AWS S3 keys to access it.
    await this.client
      .upload({
        Bucket: upload.config.aws.bucket,
        Key: file,
        ACL: "public-read",
        Body: fileContent,
        ContentType,
      })
      .promise();

    // Removes the file in "tmp" folder.
    await fs.promises.unlink(originalPath);

    return file;
  }

  async deleteFile(file: string): Promise<void> {
    // Removes the file inside bucket.
    await this.client
      .deleteObject({
        Bucket: upload.config.aws.bucket,
        Key: file,
      })
      .promise();
  }
}
