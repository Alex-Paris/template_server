export interface IHashProvider {
  /**
   * Generate a hash for forneced payload.
   * @param payload payload to be hashed.
   */
  generateHash(payload: string): Promise<string>;

  /**
   * Compare a hash with a payload.
   * @param payload payload to be compared.
   * @param hashed hashed payload to be compared.
   */
  compareHash(payload: string, hashed: string): Promise<boolean>;
}
