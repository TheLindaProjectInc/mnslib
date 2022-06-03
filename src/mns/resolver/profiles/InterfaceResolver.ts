import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface InterfaceResolver extends ResolverBase {
  setInterface(
    node: string,
    interfaceId: string,
    implementer: string
  ): Promise<TransactionReceipt[]>;
  interfaceImplementer(node: string, interfaceId: string): Promise<string>;
}
