import ABI from '../../abi';
import { CONTRACTS } from '../../constants';
import MetrixContract from '../../mrx/MetrixContract';
import { Transaction } from '../../mrx/Transaction';
import { Provider } from '../../provider';

/**
 * Class which can be used to interact with the DefaultReverseResolver
 *
 * @class
 */
export default class DefaultReverseResolver extends MetrixContract {
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
