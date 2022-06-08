import { TransactionReceipt } from '../../../mrx';
import { IERC165 } from '../../../mrx/interface/IERC165';

/**
 * Interface that represent a ContentHash Resolver
 *
 * @interface
 */
export default interface ContentHashResolver extends IERC165 {
  /**
   * Sets the contenthash associated with an MNS node.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param hash The contenthash to set
   * @returns {Promise<TransactionReceipt[]>} an array of TransactionReceipt objects
   */
  setContenthash(node: string, hash: string): Promise<TransactionReceipt[]>;
  /**
   * Returns the contenthash associated with an MNS node.
   * @param node The MNS node to query.
   * @returns {Promise<string>} The associated contenthash.
   */
  contenthash(node: string): Promise<string>;
}
