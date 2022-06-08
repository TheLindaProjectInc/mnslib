/**
 * Interface that represents a Resolver, which implements EIP165
 *
 * @interface
 */
export interface IERC165 {
  /**
   * Returns true if this contract implements the interface defined by
   * `interfaceId`. See the corresponding
   * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
   * to learn more about how these ids are created.
   *
   * This function call must use less than 30 000 gas.
   * Defined in EIP181.
   * @param interfaceId The MNS node to query.
   * @returns {Promise<boolean>} if the interface is supported
   */
  supportsInterface(interfaceId: string): Promise<boolean>;
}
