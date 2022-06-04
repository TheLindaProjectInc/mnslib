import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface ContentHashResolver extends ResolverBase {
  setContenthash(node: string, hash: string): Promise<TransactionReceipt[]>;
  contenthash(node: string): Promise<string>;
}
