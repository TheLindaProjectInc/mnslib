import { Result } from 'ethers/lib/utils'

export default interface Provider {
  network: 'MainNet' | 'TestNet'

  callContract(
    contract: string,
    method: string,
    data: string[],
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<Result | undefined>

  sendToContract(
    contract: string,
    method: string,
    data: string[],
    value: string,
    gasLimit: number,
    gasPrice: number,
    abi: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}
