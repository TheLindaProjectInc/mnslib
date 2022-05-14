import {Result} from 'ethers/lib/utils';
import Provider from '../interfaces/Provider';

export default class RPCProvider implements Provider {
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
    throw new Error('Method not implemented.');
  }
  async sendToContract(
    contract: string,
    method: string,
    data: string[],
    value: string = '0',
    gasLimit: number = 250000,
    gasPrice: number = 5000,
    abi: any[]
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
