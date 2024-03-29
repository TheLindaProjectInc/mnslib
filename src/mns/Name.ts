import {
  MetrixContract,
  Provider,
  Transaction,
  TransactionReceipt
} from '@metrixcoin/metrilib';
import { ethers } from 'ethers';
import {
  getAddrWithResolver,
  getContentWithResolver,
  getResolverContract,
  getTextWithResolver,
  setAddrWithResolver,
  setContenthashWithResolver,
  setTextWithResolver
} from '../utils/ContractUtils';

import labelhash from '../utils/labelhash';

/** Class which can be used to make record queries. */
export default class Name {
  name: string;
  mns: MetrixContract;
  provider: Provider;
  hash: string;
  resolver: string | undefined;
  constructor(
    name: string,
    mns: MetrixContract,
    provider: Provider,
    hash: string,
    resolver?: string
  ) {
    this.name = name;
    this.mns = mns;
    this.provider = provider;
    this.hash = hash;
    this.resolver = resolver;
  }

  /**
   * Get the owning address of the Name
   * @returns {Promise<string>} the address of the name
   */
  async getOwner(): Promise<string> {
    const response = await this.mns.call('owner(bytes32)', [this.hash]);
    return response ? response.toString() : ethers.ZeroAddress;
  }

  /**
   * Set the owning address of the Name
   * @param address an EVM compatible address
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setOwner(address: string): Promise<Transaction> {
    if (!address) throw new Error('No newOwner address provided!');
    const tx = await this.mns.send('setOwner(bytes32, address)', [
      this.hash,
      address
    ]);
    const getReceipts = this.provider.getTxReceipts(
      tx,
      this.mns.abi,
      this.mns.address
    );
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Get the resolver address
   * @returns {Promise<string>} the address the resolver
   */
  async getResolver(): Promise<string> {
    const response = await this.mns.call('resolver(bytes32)', [this.hash]);
    this.resolver = response ? response.toString() : ethers.ZeroAddress;
    return this.resolver;
  }

  /**
   * Set the resolver of the Name
   * @param address an EVM compatible address
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setResolver(address: string): Promise<Transaction> {
    if (!address) throw new Error('No resolver address provided!');
    const tx = await this.mns.send('setResolver(bytes32, address)', [
      this.hash,
      address
    ]);
    const getReceipts = this.provider.getTxReceipts(
      tx,
      this.mns.abi,
      this.mns.address
    );
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Get the ttl
   * @returns {Promise<number>} the address the resolver
   */
  async getTTL(): Promise<number> {
    try {
      const response = await this.mns.call('ttl(bytes32)', [this.hash]);
      return !isNaN(Number(BigInt(response ? response.toString() : '0')))
        ? Number(BigInt(response ? response.toString() : '0'))
        : 0;
    } catch (e) {
      console.log(e);
    }

    return 0;
  }

  /**
   * Sets the TTL
   * @param ttl The TTL in seconds.
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setTTL(ttl: bigint): Promise<Transaction> {
    const empty = async () => {
      return [] as TransactionReceipt[];
    };
    try {
      const tx = await this.mns.send('setTTL(bytes32,uint64)', [
        this.hash,
        `0x${ttl.toString(16)}`
      ]);
      const getReceipts = this.provider.getTxReceipts(
        tx,
        this.mns.abi,
        this.mns.address
      );
      return {
        txid: tx.txid,
        getReceipts
      };
    } catch (e) {
      console.log(e);
    }
    return {
      txid: ethers.ZeroHash.replace('0x', ''),
      getReceipts: empty()
    };
  }

  /**
   * Get the resolver address
   * @returns {Promise<string>} the address the resolver
   */
  async getResolverAddr(): Promise<string> {
    if (this.resolver) {
      return this.resolver; // hardcoded for old resolvers or specific resolvers
    } else {
      return this.getResolver();
    }
  }

  /**
   * Get an address by coin
   * @param coinId slip44 coin id
   * @returns {Promise<string>} the address the resolver
   */
  async getAddress(coinId?: string): Promise<string> {
    const resolverAddr = await this.getResolverAddr();
    if (parseInt(resolverAddr, 16) === 0) return ethers.ZeroAddress;
    const Resolver = getResolverContract(resolverAddr, this.provider);
    if (!coinId) {
      const response = await Resolver.call('addr(bytes32)', [this.hash]);
      return response ? response.toString() : ethers.ZeroAddress;
    }

    return getAddrWithResolver(this.name, coinId, resolverAddr, this.provider);
  }

  /**
   * Set the address
   * @param key a coin symbol with slip44 support like 'MRX'
   * @param address an address
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setAddress(key: string, address: string): Promise<Transaction> {
    if (!key) {
      throw new Error('No coinId provided');
    }

    if (!address) {
      throw new Error('No address provided');
    }
    const resolverAddr = await this.getResolverAddr();
    return setAddrWithResolver(
      this.name,
      key,
      address,
      resolverAddr,
      this.provider
    );
  }

  /**
   * Get the contenthash
   * @returns {Promise<string | {value: string;contentType: string;}>} the value and content or AddressZero if no resolver
   */
  async getContent(): Promise<
    | string
    | {
        value: string;
        contentType: string;
      }
  > {
    const resolverAddr = await this.getResolverAddr();
    return getContentWithResolver(this.name, resolverAddr, this.provider);
  }

  /**
   * Set the contenthash
   * @param content the hash
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setContenthash(content: string): Promise<Transaction> {
    const resolverAddr = await this.getResolverAddr();
    return setContenthashWithResolver(
      this.name,
      content,
      resolverAddr,
      this.provider
    );
  }

  /**
   * Get the contenthash
   * @param key the etext data key to query
   * @returns {Promise<string>} the text value
   */
  async getText(key: string) {
    const resolverAddr = await this.getResolverAddr();
    return getTextWithResolver(this.name, key, resolverAddr, this.provider);
  }

  /**
   * Sets the text data associated with a key.
   * @param key The key to set.
   * @param recordValue The text data value to set.
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setText(key: string, recordValue: string): Promise<Transaction> {
    const resolverAddr = await this.getResolverAddr();
    return setTextWithResolver(
      this.name,
      key,
      recordValue,
      resolverAddr,
      this.provider
    );
  }

  /**
   * Sets the owner of a subnode
   * @param label The key to set.
   * @param newOwner An address for the owner
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setSubnodeOwner(label: string, newOwner: string): Promise<Transaction> {
    const lh = labelhash(label);
    const tx = await this.mns.send(
      'setSubnodeOwner(bytes32, bytes32, address)',
      [this.hash, lh, newOwner]
    );
    const getReceipts = this.provider.getTxReceipts(
      tx,
      this.mns.abi,
      this.mns.address
    );
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Sets the record for a subnode.
   * @param label The hash of the label specifying the subnode.
   * @param newOwner The address of the new owner.
   * @param resolver The address of the resolver.
   * @param ttl The TTL in seconds.
   * @returns {Promise<Transaction>} a Transaction object
   */
  async setSubnodeRecord(
    label: string,
    newOwner: string,
    resolver: string,
    ttl = 0
  ): Promise<Transaction> {
    const lh = labelhash(label);
    const tx = await this.mns.send(
      'setSubnodeRecord(bytes32, bytes32, address, address, uint64)',
      [this.hash, lh, newOwner, resolver, `0x${BigInt(ttl).toString(16)}`]
    );
    const getReceipts = this.provider.getTxReceipts(
      tx,
      this.mns.abi,
      this.mns.address
    );
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  /**
   * Create a subdomain of this name
   * @param label The hash of the label specifying the subnode.

   * @returns {Promise<Transaction>} a Transaction object
   */
  async createSubdomain(label: string): Promise<Transaction> {
    const resolverPromise = this.getResolver();
    const ownerPromise = this.getOwner();
    const [resolver, owner] = await Promise.all([
      resolverPromise,
      ownerPromise
    ]);
    return this.setSubnodeRecord(label, owner, resolver);
  }

  async deleteSubdomain(label: string) {
    return this.setSubnodeRecord(label, ethers.ZeroAddress, ethers.ZeroAddress);
  }
}
