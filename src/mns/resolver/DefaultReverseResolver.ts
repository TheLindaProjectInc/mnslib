import ABI from '../../abi';
import { CONTRACTS } from '../../constants';
import { TransactionReceipt } from '../../mrx';
import { Provider } from '../../provider';
import BaseResolver from './BaseResolver';
import NameResolver from './profiles/NameResolver';

/**
 * Class which can be used to interact with the DefaultReverseResolver
 *
 * @class
 */
export default class DefaultReverseResolver
  extends BaseResolver
  implements NameResolver
{
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].DefaultReverseResolver,
      provider,
      ABI.DefaultReverseResolver
    );
  }

  async setName(node: string, name: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('setName(bytes32,string)', [node, name]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async name(node: string): Promise<string> {
    const result = await this.call('name(bytes32)', [node]);
    if (result) {
      result.toString();
    }
    return '';
  }
}
