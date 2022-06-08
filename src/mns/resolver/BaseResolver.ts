import { MetrixContract } from '../../mrx';
import { Provider } from '../../provider';
import { IERC165 } from '../../mrx/interface/IERC165';

/**
 * Class which is used a the base for resolvers
 *
 * @class
 */
export default abstract class BaseResolver
  extends MetrixContract
  implements IERC165
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
