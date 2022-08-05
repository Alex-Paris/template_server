import { container } from "tsyringe";

import { DiskStorageProvider } from "./implementations/DiskStorageProvider";
import { IStorageProvider } from "./models/IStorageProvider";

const providers = {
  disk: DiskStorageProvider,
  // aws-s3: AWS
};

container.registerSingleton<IStorageProvider>(
  "StorageProvider",
  providers.disk
);
