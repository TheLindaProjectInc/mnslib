import { Result } from 'ethers/lib/utils';
import { TransactionReceipt } from '../mrx';
import { NetworkType } from '../types/NetworkType';

export default interface Provider {
  network: NetworkType;

  /**
   * Get receipts from a transaction
   *
   * @param {{ txid: string; sender: string; hash160: string }} tx transaction object
   * @param {any[]} abi The abi for the contract that was called
   * @param {string|undefined} contract the contract address, if there is one
   * @return {Promise<TransactionReceipt[]>} an array of {@link TransactionReceipt} objects
   *
   */
  getTxReceipts(
    tx: { txid: string; sender: string; hash160: string },
    abi: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    contract?: string
  ): Promise<TransactionReceipt[]>;

  /**
   * Perform calltocontract
   *
   * @param {string} contract The contract address
   * @param {string} method The contract method to call
   * @param {string[]} data The arguments
   * @param {any[]} abi The contract abi
   *
   * @return {Promise<Result | undefined>} see ethers.utils.Result
   *
   */
  callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Result | undefined>;

  /**
   * Perform sendtocontract
   *
   * @param {string} contract The contract address
   * @param {string} method The contract method to send to
   * @param {string[]} data The arguments to use
   * @param {string} value The amount to send to the contract
   * @param {number} gasLimit The amount of gas units allowed
   * @param {number} gasPrice The satoshi price per gas
   * @param {any[]} abi The contract abi
   *
   * @return {Promise<Result | undefined>} see ethers.utils.Result
   *
   */
  sendToContract(
    contract: string,
    method: string,
    data: string[],
    value: string,
    gasLimit: number,
    gasPrice: number,
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  balance(address: string): Promise<bigint>;
}
