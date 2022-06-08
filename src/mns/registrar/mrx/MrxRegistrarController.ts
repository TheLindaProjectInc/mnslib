import { ethers } from 'ethers';
import ABI from '../../../abi';
import { CONTRACTS } from '../../../constants';
import { IERC165 } from '../../../mrx/interface/IERC165';
import MetrixContract from '../../../mrx/MetrixContract';
import TransactionReceipt from '../../../mrx/TransactionReceipt';
import { Provider } from '../../../provider';

export class MrxRegistrarController extends MetrixContract implements IERC165 {
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].MRXRegistrarController,
      provider,
      ABI.MRXRegistrarController
    );
  }

  async MIN_REGISTRATION_DURATION(): Promise<bigint> {
    const min = await this.call('MIN_REGISTRATION_DURATION()', []);
    const m = BigInt(min ? min.toString() : 0);
    return m ? m : BigInt(0);
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    const result = await this.call('supportsInterface(bytes4)', [interfaceId]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }

  async minCommitmentAge(): Promise<bigint> {
    const min = await this.call('minCommitmentAge()', []);
    const m = BigInt(min ? min.toString() : 0);
    return m ? m : BigInt(0);
  }

  async maxCommitmentAge(): Promise<bigint> {
    const max = await this.call('maxCommitmentAge()', []);
    const m = BigInt(max ? max.toString() : 0);
    return m ? m : BigInt(0);
  }

  async commitments(hash: string): Promise<bigint> {
    const comm = await this.call('commitments(string)', [hash]);
    const c = BigInt(comm ? comm.toString() : 0);
    return c ? c : BigInt(0);
  }

  async rentPrice(name: string, duration: bigint): Promise<bigint> {
    const price = await this.call('rentPrice(string,uint256)', [
      name,
      `0x${duration.toString(16)}`
    ]);
    const p = BigInt(price ? price.toString() : 0);
    return p ? p : BigInt(0);
  }

  async valid(name: string): Promise<boolean> {
    const isValid = await this.call('valid(string)', [name]);
    return isValid ? isValid.toString() === 'true' : false;
  }

  async available(name: string): Promise<boolean> {
    const isAvailable = await this.call('available(string)', [name]);
    return isAvailable ? isAvailable.toString() === 'true' : false;
  }

  async makeCommitment(
    name: string,
    owner: string,
    secret: string
  ): Promise<string> {
    const commitment = await this.call(
      'makeCommitment(string,address,bytes32)',
      [name, owner, secret]
    );
    return commitment ? commitment.toString() : ethers.constants.HashZero;
  }

  async makeCommitmentWithConfig(
    name: string,
    owner: string,
    secret: string,
    resolver: string,
    addr: string
  ): Promise<string> {
    const commitment = await this.call(
      'makeCommitmentWithConfig(string,address,bytes32,address,address)',
      [name, owner, secret, resolver, addr]
    );
    return commitment ? commitment.toString() : ethers.constants.HashZero;
  }

  async commit(commitment: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('commit(bytes32)', [commitment]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async register(
    name: string,
    owner: string,
    duration: bigint,
    secret: string,
    value: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send(
      'register(string,address,uint256,bytes32)',
      [name, owner, `0x${duration.toString(16)}`, secret],
      value,
      420000
    );
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async registerWithConfig(
    name: string,
    owner: string,
    duration: bigint,
    secret: string,
    resolver: string,
    addr: string,
    value: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send(
      'registerWithConfig(string,address,uint256,bytes32,address,address)',
      [name, owner, `0x${duration.toString(16)}`, secret, resolver, addr],
      value,
      420000
    );
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async renew(
    name: string,
    duration: bigint,
    value: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send(
      'renew(string,uint256)',
      [name, `0x${duration.toString(16)}`],
      value,
      420000
    );
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }
}
