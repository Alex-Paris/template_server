import { container } from "tsyringe";

import upload from "@config/upload";

import { AWSS3StorageProvider } from "./implementations/AWSS3StorageProvider";
import { DiskStorageProvider } from "./implementations/DiskStorageProvider";
import { IStorageProvider } from "./models/IStorageProvider";

const providers = {
  disk: DiskStorageProvider,
  awsS3: AWSS3StorageProvider,
};

container.registerSingleton<IStorageProvider>(
  "StorageProvider",
  providers[upload.driver]
);
