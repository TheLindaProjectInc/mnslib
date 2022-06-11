import { equal } from 'assert';
import { MNS, Name, PublicResolver } from '../..';
import { APIProvider } from '../../provider';
import { getMNSAddress } from '../../utils/ContractUtils';

describe('PublicResolver tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const resolver = new PublicResolver(provider);
  const mns = new MNS(network, provider, getMNSAddress(network));

  const first = 'first.mrx';
  const name: Name = mns.name(first);

  it('should match the public resolver address', async () => {
    const address: string = await name.getResolverAddr();
    equal(address.replace('0x', '').toLowerCase(), resolver.address);
  }).timeout(10000);

  it('should match name.getAddress() address', async () => {
    equal(await name.getAddress(), await resolver.addr(name.hash));
  }).timeout(10000);
});
