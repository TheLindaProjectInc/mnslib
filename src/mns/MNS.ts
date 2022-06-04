import { ethers } from 'ethers';
import { namehash } from 'ethers/lib/utils';
import { CONTRACTS } from '../constants';
import Provider from '../provider/Provider';
import MetrixContract from '../mrx/MetrixContract';
import Name from './Name';
import Resolver from './Resolver';
import { NetworkType } from '../types/NetworkType';
import {
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
} from '../utils/ContractUtils';
import { TransactionReceipt } from '../mrx';

/** Class which can be used to make registry record queries. */
export default class MNS {
  network: NetworkType;
  provider: Provider;
  mns: MetrixContract;

  constructor(network: NetworkType, provider: Provider, mnsAddress: string) {
    this.network = network;
    this.provider = provider;
    this.mns = getMNSContract(
      mnsAddress ? mnsAddress : CONTRACTS[network].MNSRegistryWithFallback,
      provider
    );
  }

  /**
   * Returns a Name object which can be used to make record queries
   * @param name The name for example 'first.mrx'
   * @param resolver The resolver address
   * @returns {Name} a Name object
   */
  name(name: string, resolver?: string): Name {
    return new Name(name, this.mns, this.provider, namehash(name), resolver);
  }

  /**
   * Returns a Resolver object which can be used to make record queries
   * @param address an EVM compatible address
   * @returns {Resolver} a Resolver object
   */
  resolver(address: string): Resolver {
    return new Resolver(this.mns, this.provider, address);
  }

  /**
   * Returns the name for an address from the default reverse resolver
   * @param address an EVM compatible address
   * @returns {Promise<string | undefined>} a name or undefined if one is not found
   */
  async getName(address: string): Promise<string | undefined> {
    const reverseNode = `${
      address.startsWith('0x')
        ? address.slice(2).toLowerCase()
        : address.toLowerCase()
    }.addr.reverse`;
    const resolverAddr = await this.mns.call(`resolver(bytes32)`, [
      namehash(reverseNode)
    ]);
    return this.getNameWithResolver(
      address,
      resolverAddr ? resolverAddr.toString() : ethers.constants.AddressZero
    );
  }

  /**
   * Returns the name for an address from the resolver
   * @param address an EVM compatible address
   * @param resolverAddr a specific resolver address to use
   * @returns {Promise<string | undefined>} a name or undefined if one is not found
   */
  async getNameWithResolver(
    address: string,
    resolverAddr: string
  ): Promise<string | undefined> {
    const reverseNode = `${
      address.startsWith('0x')
        ? address.slice(2).toLowerCase()
        : address.toLowerCase()
    }.addr.reverse`;
    const reverseNamehash = namehash(reverseNode);
    if (parseInt(resolverAddr, 16) === 0) {
      return undefined;
    }

    try {
      const Resolver = getResolverContract(
        resolverAddr.startsWith('0x')
          ? resolverAddr.slice(2).toLowerCase()
          : resolverAddr.toLowerCase(),
        this.provider
      );
      const name = await Resolver.call('name(bytes32)', [reverseNamehash]);
      return name ? name.toString() : undefined;
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e);
      return undefined;
    }
  }

  /**
   * Set a reverse record for an address
   * @param name The name for example 'first.mrx'
   * @returns {Promise<TransactionReceipt[]>} an array of TransactionReceipt objects
   */
  async setReverseRecord(name: string): Promise<TransactionReceipt[]> {
    const reverseRegistrarAddr = await this.name('addr.reverse').getOwner();
    const reverseRegistrar = getReverseRegistrarContract(
      reverseRegistrarAddr,
      this.provider
    );
    const tx = await reverseRegistrar.send('setName(string)', [name]);
    return await this.provider.getTxReceipts(
      tx,
      reverseRegistrar.abi,
      reverseRegistrar.address
    );
  }
}
