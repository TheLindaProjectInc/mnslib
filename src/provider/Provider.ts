import { Result } from 'ethers/lib/utils';
import { TransactionReceipt } from '../mrx';
import { NetworkType } from '../types/NetworkType';

export default interface Provider {
  network: NetworkType;

  getTxReceipts(
    tx: { txid: string; sender: string; hash160: string },
    abi: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    contract?: string
  ): Promise<TransactionReceipt[]>;

  callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Result | undefined>;

  sendToContract(
    contract: string,
    method: string,
    data: string[],
    value: string,
    gasLimit: number,
    gasPrice: number,
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
