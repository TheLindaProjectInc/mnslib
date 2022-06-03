import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface NameResolver extends ResolverBase {
  setName(node: string, name: string): Promise<TransactionReceipt[]>;
  name(node: string): Promise<string>;
}
