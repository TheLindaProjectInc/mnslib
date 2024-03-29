import { IERC165, Transaction } from '@metrixcoin/metrilib';

/**
 * Interface that represent an Address Resolver
 *
 * @interface
 */
export default interface AddrResolver extends IERC165 {
  /**
   * Sets the address associated with an MNS node.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param a The address to set.
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  setAddr(node: string, a: string): Promise<Transaction>;

  /**
   * Sets the address associated with an MNS node.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param coinType the slip44 id of the coin
   * @param a The address to set.
   * @returns {{{Promise<Transaction>}}} an array of TransactionReceipt objects
   */
  setAddrByType(
    node: string,
    coinType: bigint,
    a: string
  ): Promise<Transaction>;

  /**
   * Returns the address associated with an MNS node.
   * @param node The MNS node to query.
   * @returns {Promise<string>} The associated address.
   */
  addr(node: string): Promise<string>;

  /**
   * Returns the address associated with an MNS node.
   * @param node The MNS node to query.
   * @param coinType the slip44 id of the coin
   * @returns {Promise<string>} The associated address.
   */
  addrByType(node: string, coinType: bigint): Promise<string>;
}
