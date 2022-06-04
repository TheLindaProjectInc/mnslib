import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

/**
 * Interface that represents an Text Resolver
 *
 * @interface
 */
export default interface TextResolver extends ResolverBase {
  /**
   * Sets the text data associated with an MNS node and key.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param key The key to set.
   * @param value The text data value to set.
   * @returns {Promise<TransactionReceipt[]>} an array of TransactionReceipt objects
   */
  setText(
    node: string,
    key: string,
    value: string
  ): Promise<TransactionReceipt[]>;
  /**
   * Returns the text data associated with an MNS node and key.
   * @param node The MNS node to query.
   * @param key The text data key to query.
   * @returns {Promise<string>} The associated text data.
   */
  text(node: string, key: string): Promise<string>;
}
