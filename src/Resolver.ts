import { namehash } from 'ethers/lib/utils'
import Provider from './interfaces/Provider'
import MetrixContract from './MetrixContract'
import Name from './Name'

export default class Resolver {
  mns: MetrixContract
  provider: Provider
  address: string

  constructor(mns: MetrixContract, provider: Provider, address: string) {
    this.mns = mns
    this.provider = provider
    this.address = address
  }

  name(name: string) {
    return new Name(name, this.mns, this.provider, namehash(name), this.address)
  }
}
