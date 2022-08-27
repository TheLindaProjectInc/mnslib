import { IERC165, Transaction } from '@metrixcoin/metrilib';

/**
 * Interface that represent an ABI Resolver
 *
 * @interface
 */
export default interface ABIResolver extends IERC165 {
  /**
   * Sets the ABI associated with an MNS node.
   * Nodes may have one ABI of each content type. To remove an ABI, set it to
   * the empty string.
   * @param node The node to update.
   * @param contentType The content type of the ABI
   * @param data The ABI data.
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  setABI(node: string, contentType: bigint, data: string): Promise<Transaction>;
  /**
   * Returns the ABI associated with an MNS node.
   * Defined in EIP205.
   * @param node The MNS node to query
   * @param contentType A bitwise OR of the ABI formats accepted by the caller.
   * @returns {Promise<[contentType: bigint, data: string]>} [contentType,data] The content type of the return data value
   */
  ABI(
    node: string,
    contentType: bigint
  ): Promise<[contentType: bigint, data: string]>;
}
