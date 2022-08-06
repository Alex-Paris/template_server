export interface IStorageProvider {
  /**
   * Save the forneced file to the storage.
   * @param file file name to be storaged.
   */
  saveFile(file: string): Promise<string>;

  /**
   * Delete the forneced file of the storage.
   * @param file file name to be deleted.
   */
  deleteFile(file: string): Promise<void>;
}
