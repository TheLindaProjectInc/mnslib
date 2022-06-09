import { ethers } from 'ethers';
import ABI from '../../../abi';
import { CONTRACTS } from '../../../constants';
import MetrixContract from '../../../mrx/MetrixContract';
import { Transaction } from '../../../mrx/Transaction';
import { Provider } from '../../../provider';

/**
 * A registrar that allocates subdomains to the first person to claim them, but
 * expires registrations a fixed period after they're initially claimed.
 * @class
 */
export class TestRegistrar extends MetrixContract {
  constructor(provider: Provider) {
    if (provider.network !== 'TestNet') {
      throw new Error('TestRegistrar contract only available on the TestNet');
    }
    super(
      CONTRACTS[provider.network].TestRegistrar
        ? (CONTRACTS[provider.network].TestRegistrar as string)
        : ethers.constants.AddressZero.replace('0x', ''),
      provider,
      ABI.TestRegistrar
    );
  }
  /**
   * Get the MNS address
   * @returns {Promise<string>} the address of the MNS Registry
   */
  async mns(): Promise<string> {
    const mnsAddr = await this.call('mns()', []);
    return mnsAddr ? mnsAddr.toString() : ethers.constants.AddressZero;
  }

  /**
   * Get the root node of this registrar
   * @returns {Promise<string>} the root node of this registrar
   */
  async rootNode(): Promise<string> {
    const node = await this.call('rootNode()', []);
    return node ? node.toString() : ethers.constants.HashZero;
  }

  /**
   * Get the expiry time of a label
   * @param label The hash of the label to register.
   * @returns {Promise<bigint>} the expiry of the label
   */
  async expiryTimes(label: string): Promise<bigint> {
    const expiry = await this.call('expiryTimes(string)', [label]);
    const ex = BigInt(expiry ? expiry.toString() : 0);
    return ex ? ex : BigInt(0);
  }

  /**
   * Register a name that's not currently registered
   * @param label The hash of the label to register.
   * @param owner The address of the new owner.
   * @returns {Promise<Transaction>} aTransaction object
   */
  async register(label: string, owner: string): Promise<Transaction> {
    const tx = await this.send('register(bytes32,address)', [label, owner]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }
}
