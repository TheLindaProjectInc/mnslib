import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface ContentHashResolver extends ResolverBase {
  /**
   * Sets the contenthash associated with an MNS node.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param hash The contenthash to set
   * @returns {Promise<TransactionReceipt[]} an array of TransactionReceipt objects
   */
  setContenthash(node: string, hash: string): Promise<TransactionReceipt[]>;
  /**
   * Returns the contenthash associated with an MNS node.
   * @param node The MNS node to query.
   * @returns {Promise<string>} The associated contenthash.
   */
  contenthash(node: string): Promise<string>;
}
