import { MetrixContract, Provider, Transaction } from '@metrixcoin/metrilib';
import { ethers } from 'ethers';
import ABI from '../../../abi';
import { CONTRACTS } from '../../../constants';

/**
 * A registrar that allocates subdomains to the first person to claim them, but
 * expires registrations a fixed period after they're initially claimed.
 * @class
 */
export class ReverseRegistrar extends MetrixContract {
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].ReverseRegistrar,
      provider,
      ABI.ReverseRegistrar
    );
  }
  /**
   * Get the MNS address
   * @returns {Promise<string>} the address of the MNS Registry
   */
  async mns(): Promise<string> {
    const mnsAddr = await this.call('mns()', []);
    return mnsAddr ? mnsAddr.toString() : ethers.ZeroAddress;
  }

  /**
   * Get the root node of this registrar
   * @returns {Promise<string>} the root node of this registrar
   */
  async defaultResolver(): Promise<string> {
    const resolver = await this.call('defaultResolver()', []);
    return resolver ? resolver.toString() : ethers.ZeroAddress;
  }

  /**
   * Transfers ownership of the reverse MNS record associated with the
   *      calling account.
   * @param owner The address to set as the owner of the reverse record in MNS.
   * @return The MNS node hash of the reverse record.
   */
  async claim(owner: string): Promise<Transaction> {
    const tx = await this.send('claim(address)', [owner]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Transfers ownership of the reverse MNS record associated with the
   *      calling account.
   * @param addr The reverse record to set
   * @param owner The address to set as the owner of the reverse record in MNS.
   * @return The MNS node hash of the reverse record.
   */
  async claimForAddr(addr: string, owner: string): Promise<Transaction> {
    const tx = await this.send('claimForAddr(address,address)', [addr, owner]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }
  /**
   * Transfers ownership of the reverse MNS record associated with the
   *      calling account.
   * @param owner The address to set as the owner of the reverse record in MNS.
   * @param resolver The address of the resolver to set; 0 to leave unchanged.
   * @return The MNS node hash of the reverse record.
   */
  async claimWithResolver(
    owner: string,
    resolver: string
  ): Promise<Transaction> {
    const tx = await this.send('claimWithResolver(string)', [owner, resolver]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Transfers ownership of the reverse MNS record specified with the
   *      address provided
   * @param addr The reverse record to set
   * @param owner The address to set as the owner of the reverse record in MNS.
   * @param resolver The address of the resolver to set; 0 to leave unchanged.
   * @return The MNS node hash of the reverse record.
   */
  async claimWithResolverForAddr(
    addr: string,
    owner: string,
    resolver: string
  ): Promise<Transaction> {
    const tx = await this.send(
      'claimWithResolverForAddr(address,address,address)',
      [addr, owner, resolver]
    );
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Sets the `name()` record for the reverse MNS record associated with
   * the calling account. First updates the resolver to the default reverse
   * resolver if necessary.
   * @param name The name to set for this address.
   * @return The MNS node hash of the reverse record.
   */
  async setName(name: string): Promise<Transaction> {
    const tx = await this.send('setName(string)', [name]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Sets the `name()` record for the reverse MNS record associated with
   * the account provided. First updates the resolver to the default reverse
   * resolver if necessary.
   * Only callable by controllers and authorised users
   * @param addr The reverse record to set
   * @param owner The owner of the reverse node
   * @param name The name to set for this address.
   * @return The MNS node hash of the reverse record.
   */
  async setNameForAddr(
    addr: string,
    owner: string,
    name: string
  ): Promise<Transaction> {
    const tx = await this.send('setNameForAddr(address,address,string)', [
      addr,
      owner,
      name
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Returns the node hash for a given account's reverse records.
   * @param addr The address to hash
   * @return The MNS node hash.
   */
  async node(addr: string): Promise<string> {
    const n = await this.call('node(address)', [addr]);
    return n ? n.toString() : ethers.ZeroHash;
  }
}
