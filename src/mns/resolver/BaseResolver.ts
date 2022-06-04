import { MetrixContract } from '../../mrx';
import { Provider } from '../../provider';
import ResolverBase from './profiles/ResolverBase';

/**
 * Class which is used a the base for resolvers
 *
 * @class
 */
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
}
