import { namehash } from 'ethers/lib/utils';
import Provider from '../provider/Provider';
import MetrixContract from '../mrx/MetrixContract';
import Name from './Name';

export default class Resolver {
  mns: MetrixContract;
  provider: Provider;
  address: string;

  constructor(mns: MetrixContract, provider: Provider, address: string) {
    this.mns = mns;
    this.provider = provider;
    this.address = address;
  }

  name(name: string) {
    return new Name(
      name,
      this.mns,
      this.provider,
      namehash(name),
      this.address
    );
  }
}
