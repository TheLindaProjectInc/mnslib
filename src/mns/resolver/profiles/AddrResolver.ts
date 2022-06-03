import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface AddrResolver extends ResolverBase {
  setAddr(node: string, a: string): Promise<TransactionReceipt[]>;
  setAddrByType(
    node: string,
    coinType: bigint,
    a: string
  ): Promise<TransactionReceipt[]>;
  addr(node: string): Promise<string>;
  addrByType(node: string, coinType: bigint): Promise<string>;
}
