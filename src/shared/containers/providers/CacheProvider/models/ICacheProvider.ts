export interface ICacheProvider {
  /**
   * Save content of a key in cache.
   * @param key where content value will be saved.
   * @param value content to be saved.
   */
  save(key: string, value: any): Promise<void>;

  /**
   * Recover saved value content of a key in cache.
   * @param key where content value must be recovered.
   */
  recover<T>(key: string): Promise<T | null>;

  /**
   * Delete value content of a key in cache.
   * @param key where content value must be deleted.
   */
  invalidate(key: string): Promise<void>;

  /**
   * Delete value content of keys that have same prefix forneced.
   * @param prefix to search keys that partially match to delete.
   */
  invalidatePrefix(prefix: string): Promise<void>;
}
