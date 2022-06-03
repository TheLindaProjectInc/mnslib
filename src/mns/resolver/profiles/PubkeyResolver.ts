import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface PubkeyResolver extends ResolverBase {
  setPubkey(node: string, x: string, y: string): Promise<TransactionReceipt[]>;
  pubkey(node: string): Promise<[x: string, y: string]>;
}
