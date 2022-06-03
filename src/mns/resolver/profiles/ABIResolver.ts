import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface ABIResolver extends ResolverBase {
  setABI(
    node: string,
    contentType: bigint,
    data: string
  ): Promise<TransactionReceipt[]>;
  ABI(node: string, contentType: bigint): Promise<[bigint, string]>;
}
