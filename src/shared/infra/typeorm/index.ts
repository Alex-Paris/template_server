import { pgDataSource } from "./data-source";

pgDataSource.initialize().catch((error) => console.log(error));
