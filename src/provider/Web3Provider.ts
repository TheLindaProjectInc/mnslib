import { ethers } from 'ethers';
import { Result } from 'ethers/lib/utils';
import Provider from './Provider';
import { TransactionReceipt } from '../mrx';
import { NetworkType } from '../types/NetworkType';

export default class Web3Provider implements Provider {
  network: NetworkType;

  constructor(network: NetworkType) {
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
      const response = await fetch(`${uri}/tx/${txid}`);
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

  // eslint-disable-next-line
  async getTxReceipts(
    tx: { txid: string; sender: string; hash160: string },
    abi: any[], // eslint-disable-line
    contract?: string // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
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
        [contract.toLowerCase().replace('0x', ''), encoded.replace('0x', '')]
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
        [
          contract.toLowerCase().replace('0x', ''),
          encoded.replace('0x', ''),
          value,
          gasLimit,
          gasPrice
        ]
      );
      return result && result.txid != undefined
        ? {
            txid: result.txid,
            sender: ethers.constants.AddressZero.replace('0x', ''),
            hash160: ethers.constants.AddressZero.replace('0x', '')
          }
        : {
            txid: ethers.constants.HashZero.replace('0x', ''),
            sender: ethers.constants.AddressZero.replace('0x', ''),
            hash160: ethers.constants.AddressZero.replace('0x', '')
          };
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }
}
