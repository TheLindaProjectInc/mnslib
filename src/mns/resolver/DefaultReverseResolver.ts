import { Provider, Transaction } from '@metrixcoin/metrilib';
import ABI from '../../abi';
import { CONTRACTS } from '../../constants';
import BaseResolver from './BaseResolver';

/**
 * Class which can be used to interact with the DefaultReverseResolver
 *
 * @class
 */
export default class DefaultReverseResolver extends BaseResolver {
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].DefaultReverseResolver,
      provider,
      ABI.DefaultReverseResolver
    );
  }

  async setName(node: string, name: string): Promise<Transaction> {
    const tx = await this.send('setName(bytes32,string)', [node, name]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async name(node: string): Promise<string> {
    const result = await this.call('name(bytes32)', [node]);
    if (result != undefined) {
      return result.toString();
    }
    return '';
  }
}
