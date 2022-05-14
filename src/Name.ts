import {ethers} from 'ethers';
import Provider from './interfaces/Provider';
import {
  getAddrWithResolver,
  getContentWithResolver,
  getResolverContract,
  getTextWithResolver,
  setAddrWithResolver,
  setContenthashWithResolver,
  setTextWithResolver,
} from './utils/ContractUtils';
import {labelhash} from './utils/Namehash';
import MetrixContract from './MetrixContract';

export default class Name {
  name: string;
  mns: MetrixContract;
  provider: Provider;
  hash: string;
  resolver: string;
  constructor(
    name: string,
    mns: MetrixContract,
    provider: Provider,
    hash: string,
    resolver: string
  ) {
    this.name = name;
    this.mns = mns;
    this.provider = provider;
    this.hash = hash;
    this.resolver = resolver;
  }
  async getOwner() {
    const response = await this.mns.call('owner(bytes32)', [this.hash]);
    return response ? response.toString() : ethers.constants.AddressZero;
  }

  async setOwner(address: string) {
    if (!address) throw new Error('No newOwner address provided!');
    return this.mns.send('setOwner(bytes32, address)', [this.hash, address]);
  }

  async getResolver() {
    const response = await this.mns.call('resolver(bytes32)', [this.hash]);
    return response ? response.toString() : ethers.constants.AddressZero;
  }

  async setResolver(address: string) {
    if (!address) throw new Error('No resolver address provided!');
    return this.mns.send('setResolver(bytes32, address)', [this.hash, address]);
  }

  async getTTL() {
    const response = await this.mns.call('ttl(bytes32)', [this.hash]);
    return response ? parseInt(response.toString()) : 0;
  }

  async getResolverAddr() {
    if (this.resolver) {
      return this.resolver; // hardcoded for old resolvers or specific resolvers
    } else {
      return this.getResolver();
    }
  }

  async getAddress(coinId?: string) {
    const resolverAddr = await this.getResolverAddr();
    if (parseInt(resolverAddr, 16) === 0) return ethers.constants.AddressZero;
    const Resolver = getResolverContract(resolverAddr, this.provider);
    if (!coinId) {
      const response = await Resolver.call('addr(bytes32)', [this.hash]);
      return response ? response.toString() : ethers.constants.AddressZero;
    }

    return getAddrWithResolver(this.name, coinId, resolverAddr, this.provider);
  }

  async setAddress(key: string, address: string) {
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

  async getContent() {
    const resolverAddr = await this.getResolverAddr();
    return getContentWithResolver(this.name, resolverAddr, this.provider);
  }

  async setContenthash(content: string) {
    const resolverAddr = await this.getResolverAddr();
    return setContenthashWithResolver(
      this.name,
      content,
      resolverAddr,
      this.provider
    );
  }

  async getText(key: string) {
    const resolverAddr = await this.getResolverAddr();
    return getTextWithResolver(this.name, key, resolverAddr, this.provider);
  }

  async setText(key: string, recordValue: string) {
    const resolverAddr = await this.getResolverAddr();
    return setTextWithResolver(
      this.name,
      key,
      recordValue,
      resolverAddr,
      this.provider
    );
  }

  async setSubnodeOwner(label: string, newOwner: string) {
    const lh = labelhash(label);
    return this.mns.send('setSubnodeOwner(bytes32, bytes32, address)', [
      this.hash,
      lh,
      newOwner,
    ]);
  }

  async setSubnodeRecord(
    label: string,
    newOwner: string,
    resolver: string,
    ttl = 0
  ) {
    const lh = labelhash(label);
    return this.mns.send(
      'setSubnodeRecord(bytes32, bytes32, address, address, uint64)',
      [this.hash, lh, newOwner, resolver, `0x${BigInt(ttl).toString(16)}`]
    );
  }

  async createSubdomain(label: string) {
    const resolverPromise = this.getResolver();
    const ownerPromise = this.getOwner();
    const [resolver, owner] = await Promise.all([
      resolverPromise,
      ownerPromise,
    ]);
    return this.setSubnodeRecord(label, owner, resolver);
  }

  async deleteSubdomain(label: string) {
    return this.setSubnodeRecord(
      label,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    );
  }
}
