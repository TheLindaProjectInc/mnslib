import { MetrixContract, Provider } from '../..';
import ResolverBase from './profiles/ResolverBase';

export default abstract class BaseResolver
  extends MetrixContract
  implements ResolverBase
{
  constructor(
    address: string,
    provider: Provider,
    abi: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    bytecode?: string
  ) {
    super(address, provider, abi, bytecode);
  }
  async supportsInterface(interfaceId: string): Promise<boolean> {
    const result = await this.call('supportsInterface(bytes4)', [interfaceId]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }

  async isAuthorized(node: string): Promise<boolean> {
    const result = await this.call('isAuthorzied(bytes32)', [node]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }
}
