import { ethers } from 'ethers'
import { Result } from 'ethers/lib/utils'
import Provider from '../interfaces/Provider'

export default class Web3Provider implements Provider {
  network: 'MainNet' | 'TestNet'

  constructor(network: 'MainNet' | 'TestNet') {
    this.network = network
  }

  async callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Result | undefined> {
    switch (this.network) {
      case 'MainNet':
        break
      case 'TestNet':
        break
      default:
        return undefined
    }
    const iface = new ethers.utils.Interface(abi)
    const encoded = iface.encodeFunctionData(method, data).replace('0x', '')
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (window as any).metrimask.rpcProvider.rawCall(
        'callcontract',
        [contract, encoded.replace('0x', '')]
      )
      const response = (await result).executionResult.output
      const decoded: ethers.utils.Result = iface.decodeFunctionResult(
        method,
        `0x${response}`
      )
      return decoded
    } catch (e) {
      console.log('error!!!')
      console.log(e)
    }
    return undefined
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
        break
      case 'TestNet':
        break
      default:
        return undefined
    }
    const iface = new ethers.utils.Interface(abi)
    const encoded = iface.encodeFunctionData(method, data).replace('0x', '')
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (window as any).metrimask.rpcProvider.rawCall(
        'sendtocontract',
        [contract, encoded.replace('0x', ''), value, gasLimit, gasPrice]
      )
      return result.txid
        ? result.txid
        : ethers.constants.HashZero.replace('0x', '')
    } catch (e) {
      console.log(e)
    }
    return undefined
  }
}
