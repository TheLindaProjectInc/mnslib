import {ethers, utils} from 'ethers';
import Provider from './interfaces/Provider';

const AddressZero = ethers.constants.AddressZero.replace('0x', '');

export default class MetrixContract {
  address: string;
  provider: Provider;
  abi: any[];
  bytecode: string | undefined;

  constructor(
    address: string,
    provider: Provider,
    abi: any[],
    bytecode?: string
  ) {
    this.address = address;
    this.provider = provider;
    this.abi = abi;
    this.bytecode = bytecode;
  }

  /**
   * Perform calltocontract
   *
   * @param {string} method The contract method to call
   * @param {string[]|undefined} args The arguments
   *
   * @return {utils.Result} see ethers.utils.Result
   *
   * @public
   */
  public async call(method: string, args: string[]): Promise<any> {
    return this.provider.callContract(this.address, method, args, this.abi);
  }

  /**
   * Perform sendtocontract
   *
   * @param {string} method The contract method to send to
   * @param {string[] | undefined} args The arguments to use
   * @param {string | undefined} value The amount to send to the contract
   * @param {number | undefined} gasLimit The amount of gas units allowed
   * @param {number | undefined} gasPrice The satoshi price per gas
   *
   * @return {utils.Result} see ethers.utils.Result
   *
   * @public
   */
  public async send(
    method: string,
    args: string[],
    value: string | undefined = '0',
    gasLimit: number | undefined = 250000,
    gasPrice: number | undefined = 5000
  ): Promise<{
    txid: string;
    sender: string;
    hash160: string;
  }> {
    return this.provider.sendToContract(
      this.address,
      method,
      args,
      value,
      gasLimit,
      gasPrice,
      this.abi
    );
  }
}
