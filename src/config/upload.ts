import crypto from "crypto";
import multer, { StorageEngine } from "multer";
import path from "path";

interface IUploadConfig {
  /** Driver to be used for upload files. _(Default: "disk")_ . */
  driver: "disk" | "awsS3";

  /** Temp folder where multer will put all inserted files before upload. */
  tmpFolder: string;
  /** Upload folder for disk driver. */
  uploadsFolder: string;

  /** Multer middleware configuration. */
  multer: {
    storage: StorageEngine;
  };

  /** Driver configurations. */
  config: {
    aws: {
      bucket: string;
      region: string;
    };
  };
}

const tmpFolder = path.resolve(__dirname, "..", "..", "tmp");

export default {
  driver: process.env.STORAGE_DRIVER || "disk",

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
