import { CONTRACTS, MetrixContract, Provider } from '../..';
import ABI from '../../abi';
import ResolverBase from './profiles/ResolverBase';

export default abstract class BaseResolver
  extends MetrixContract
  implements ResolverBase
{
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
