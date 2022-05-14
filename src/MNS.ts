import {CONTRACTS} from './constants';
import Provider from './interfaces/Provider';
import Name from './Name';
import Resolver from './Resolver';
import {NetworkType} from './types/NetworkType';
import {
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract,
} from './utils/ContractUtils';
import {namehash} from './utils/Namehash';

export default class MNS {
  network: NetworkType;
  provider: Provider;
  mns: any;

  constructor(network: NetworkType, provider: Provider, mnsAddress: string) {
    this.network = network;
    this.provider = provider;
    this.mns = getMNSContract(
      mnsAddress ? mnsAddress : CONTRACTS[network].MNSRegistryWithFallback,
      provider
    );
  }

  name(name: string, resolver?: string): Name {
    return new Name(name, this.mns, this.provider, namehash(name), resolver);
  }

  resolver(address: string) {
    return new Resolver(this.mns, this.provider, address);
  }

  async getName(address: string) {
    const reverseNode = `${address}.addr.reverse`;
    const resolverAddr = await this.mns.resolver(namehash(reverseNode));
    return this.getNameWithResolver(address, resolverAddr);
  }

  async getNameWithResolver(address: string, resolverAddr: string) {
    const reverseNode = `${address}.addr.reverse`;
    const reverseNamehash = namehash(reverseNode);
    if (parseInt(resolverAddr, 16) === 0) {
      return {
        name: null,
      };
    }

    try {
      const Resolver = getResolverContract(resolverAddr, this.provider);
      const name = await Resolver.call('name(bytes32)', [reverseNamehash]);
      return {
        name,
      };
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e);
    }
  }

  async setReverseRecord(name: string) {
    const reverseRegistrarAddr = await this.name('addr.reverse').getOwner();
    const reverseRegistrar = getReverseRegistrarContract(
      reverseRegistrarAddr,
      this.provider
    );
    return reverseRegistrar.send('setName(string)', [name]);
  }
}
