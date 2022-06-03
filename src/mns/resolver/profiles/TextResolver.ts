import { TransactionReceipt } from '../../../mrx';
import ResolverBase from './ResolverBase';

export default interface TextResolver extends ResolverBase {
  setText(
    node: string,
    key: string,
    value: string
  ): Promise<TransactionReceipt[]>;
  text(node: string, key: string): Promise<string>;
}
