import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface PubkeyResolver extends ResolverBase {
  /**
   * Sets the SECP256k1 public key associated with an MNS node.
   * @param node The MNS node to query
   * @param x the X coordinate of the curve point for the public key.
   * @param y the Y coordinate of the curve point for the public key.
   * @returns {Promise<TransactionReceipt[]} an array of TransactionReceipt objects
   */
  setPubkey(node: string, x: string, y: string): Promise<TransactionReceipt[]>;
  /**
   * Returns the SECP256k1 public key associated with an MNS node.
   * Defined in EIP 619.
   * @param node The MNS node to query
   * @returns {Promise<[x: string, y: string]>} x and y coordinates of the curve point for the public key.
   */
  pubkey(node: string): Promise<[x: string, y: string]>;
}
