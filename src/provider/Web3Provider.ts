import { ethers } from 'ethers';
import { Result } from 'ethers/lib/utils';
import Provider from '../interfaces/Provider';
import TransactionReceipt from '../lib/interface/TransactionReceipt';

export default class Web3Provider implements Provider {
  network: 'MainNet' | 'TestNet';

  constructor(network: 'MainNet' | 'TestNet') {
    this.network = network;
  }

  private async getTransactionReceipt(
    txid: string
  ): Promise<TransactionReceipt | undefined> {
    let uri;
    switch (this.network) {
      case 'MainNet':
        uri = 'https://explorer.metrixcoin.com/api';
        break;
      case 'TestNet':
        uri = 'https://testnet-explorer.metrixcoin.com/api';
        break;
      default:
        return undefined;
    }
    let receipt: TransactionReceipt | undefined;
    try {
      const response = await fetch(`${uri}/api/tx/${txid}`);
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          receipt = JSON.parse(JSON.stringify(await response.json()));
        }
      }
    } catch (e) {
      console.log(e);
    }

    return receipt;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getTxReceipts(tx: any, abi: any[], contract?: string) {
    if (!abi) {
      return [];
    }
    const receipts: TransactionReceipt[] = [];
    try {
      const { txid, sender, hash160 } = tx; // eslint-disable-line @typescript-eslint/no-unused-vars
      const checkConfirm = async () => {
        const receipt = await this.getTransactionReceipt(txid);
        return receipt;
      };
      const confirmed = await checkConfirm();
      if (
        confirmed && confirmed.confirmations != undefined
          ? confirmed.confirmations > 0
          : false
      ) {
        receipts.push(confirmed as TransactionReceipt);
      } else {
        let receipt: TransactionReceipt | undefined;
        for (let i = 0; i < 30; i++) {
          receipt = await checkConfirm();
          if (!receipt) {
            await new Promise((resolve) => setTimeout(resolve, 60000));
          } else {
            if (
              receipt.confirmations != undefined
                ? receipt.confirmations > 0
                : false
            ) {
              break;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 60000));
            }
          }
        }
        if (receipt) {
          receipts.push(receipt);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(
        `Failed, ${e.message ? e.message : 'An unknown error occurred'}`
      );
      return receipts;
    }
    return receipts;
  }

  async callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Result | undefined> {
    switch (this.network) {
      case 'MainNet':
        break;
      case 'TestNet':
        break;
      default:
        return undefined;
    }
    const iface = new ethers.utils.Interface(abi);
    const encoded = iface.encodeFunctionData(method, data).replace('0x', '');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (window as any).metrimask.rpcProvider.rawCall(
        'callcontract',
        [contract, encoded.replace('0x', '')]
      );
      const response = (await result).executionResult.output;
      const decoded: ethers.utils.Result = iface.decodeFunctionResult(
        method,
        `0x${response}`
      );
      return decoded;
    } catch (e) {
      console.log('error!!!');
      console.log(e);
    }
    return undefined;
  }

  async sendToContract(
    contract: string,
    method: string,
    data: string[],
    value = '0',
    gasLimit = 250000,
    gasPrice = 5000,
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    switch (this.network) {
      case 'MainNet':
        break;
      case 'TestNet':
        break;
      default:
        return undefined;
    }
    const iface = new ethers.utils.Interface(abi);
    const encoded = iface.encodeFunctionData(method, data).replace('0x', '');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (window as any).metrimask.rpcProvider.rawCall(
        'sendtocontract',
        [contract, encoded.replace('0x', ''), value, gasLimit, gasPrice]
      );
      return result.txid
        ? result.txid
        : ethers.constants.HashZero.replace('0x', '');
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}
