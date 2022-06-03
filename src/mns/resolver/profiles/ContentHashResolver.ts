import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface ContentHashResolver extends ResolverBase {
  setContentHash(node: string, hash: string): Promise<TransactionReceipt[]>;
  contentHash(node: string): Promise<string>;
}
