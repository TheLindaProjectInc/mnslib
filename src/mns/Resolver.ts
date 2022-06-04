import { namehash } from 'ethers/lib/utils';
import Provider from '../provider/Provider';
import MetrixContract from '../mrx/MetrixContract';
import Name from './Name';
/** Class which can be used to get a Name object to make queries with. */
export default class Resolver {
  mns: MetrixContract;
  provider: Provider;
  address: string;

  constructor(mns: MetrixContract, provider: Provider, address: string) {
    this.mns = mns;
    this.provider = provider;
    this.address = address;
  }

  /**
   * Returns a Name object which can be used to make record queries
   * @param name The name for example 'first.mrx'
   * @returns {Name} a Name object
   */
  name(name: string): Name {
    return new Name(
      name,
      this.mns,
      this.provider,
      namehash(name),
      this.address
    );
  }
}
