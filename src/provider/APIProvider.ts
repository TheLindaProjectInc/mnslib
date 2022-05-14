import {ethers} from 'ethers';
import fetch from 'node-fetch';
import {Result} from 'ethers/lib/utils';
import Provider from '../interfaces/Provider';

export default class APIProvider implements Provider {
  network: 'MainNet' | 'TestNet';

  constructor(network: 'MainNet' | 'TestNet') {
    this.network = network;
  }
  async callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[]
  ): Promise<Result | undefined> {
    const iface = new ethers.utils.Interface(abi);
    const encoded = iface.encodeFunctionData(method, data).replace('0x', '');
    let uri = '';
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
    //const raw = await fetch(`${uri}/contract/${contract}/call?data=${encoded}`);
    const raw = await (
      await fetch(
        `${uri}/contract/${
          contract.startsWith('0x')
            ? contract.slice(2).toLowerCase()
            : contract.toLowerCase()
        }/call?data=${encoded}`
      )
    ).json();

    if (raw) {
      const output = raw.executionResult.output;
      const decoded = iface.decodeFunctionResult(method, `0x${output}`);
      return decoded;
    } else {
      // failed to get a response
      console.log('response failed');
    }
    return undefined;
  }

  async sendToContract(
    contract: string,
    method: string,
    data: string[],
    value: string,
    gasLimit: number,
    gasPrice: number,
    abi: any[]
  ): Promise<any> {
    return undefined;
  }
}
