import { IERC165 } from '../../../mrx/interface/IERC165';
import { Transaction } from '../../../mrx/Transaction';

/**
 * Interface that represents a Name Resolver
 *
 * @interface
 */
export default interface NameResolver extends IERC165 {
  /**
   * Sets the name associated with an MNS node, for reverse records.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param name The name to set.
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  setName(node: string, name: string): Promise<Transaction>;
  /**
   * Returns the name associated with an MNS node, for reverse records.
   * Defined in EIP181.
   * @param node The MNS node to query.
   * @returns {Promise<string>} The associated name.
   */
  name(node: string): Promise<string>;
}
