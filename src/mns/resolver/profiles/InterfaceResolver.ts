import { TransactionReceipt } from '../../../mrx';
import IERC165 from '../../../mrx/interface/IERC165';

/**
 * Interface that represents an Interface Resolver
 *
 * @interface
 */
export default interface InterfaceResolver extends IERC165 {
  /**
   * Sets an interface associated with a name.
   * Setting the address to 0 restores the default behaviour of querying the contract at `addr()` for interface support.
   * @param node The node to update.
   * @param interfaceId The EIP 165 interface ID.
   * @param implementer The address of a contract that implements this interface for this node.
   * @returns {Promise<TransactionReceipt[]>} an array of TransactionReceipt objects
   */
  setInterface(
    node: string,
    interfaceId: string,
    implementer: string
  ): Promise<TransactionReceipt[]>;

  /**
   * Returns the address of a contract that implements the specified interface for this name.
   * If an implementer has not been set for this interfaceID and name, the resolver will query
   * the contract at `addr()`. If `addr()` is set, a contract exists at that address, and that
   * contract implements EIP165 and returns `true` for the specified interfaceID, its address
   * will be returned.
   * @param node The MNS node to query.
   * @param interfaceId The EIP 165 interface ID to check for.
   * @returns {Promise<string>} The address that implements this interface, or 0 if the interface is unsupported.
   */
  interfaceImplementer(node: string, interfaceId: string): Promise<string>;
}
