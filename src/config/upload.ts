import crypto from "crypto";
import multer, { StorageEngine } from "multer";
import path from "path";

interface IUploadConfig {
  driver: "disk" | "awsS3";

  tmpFolder: string;
  uploadsFolder: string;

  multer: {
    storage: StorageEngine;
  };

  config: {
    aws: {
      bucket: string;
      region: string;
    };
  };
}

const tmpFolder = path.resolve(__dirname, "..", "..", "tmp");

export default {
  driver: process.env.STORAGE_DRIVER,

  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, "uploads"),

  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename(request, file, callback) {
        const fileHash = crypto.randomBytes(10).toString("hex");
        const filename = `${fileHash}-${file.originalname}`;

        return callback(null, filename);
      },
    }),
  },

  config: {
    aws: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
    },
  },
} as IUploadConfig;
