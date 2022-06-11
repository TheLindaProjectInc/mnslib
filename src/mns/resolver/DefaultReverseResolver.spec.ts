import { equal } from 'assert';
import { MNS, Name, DefaultReverseResolver } from '../..';
import { APIProvider } from '../../provider';
import { getMNSAddress } from '../../utils/ContractUtils';

describe('DefaultReverseResolver tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const resolver = new DefaultReverseResolver(provider);
  const mns = new MNS(network, provider, getMNSAddress(network));

  const reverse = 'c87bb8ab63de99a58a5339217c4a1c92f0fbfefe.addr.reverse';
  const name: Name = mns.name(reverse, resolver.address);

  it('should match the default reverse resolver address', async () => {
    const address = await name.getResolver();
    equal(address.replace('0x', '').toLowerCase(), resolver.address);
  }).timeout(10000);

  it('should match resolver.name(hash) address', async () => {
    const label = await resolver.name(name.hash);
    equal('first.mrx', label);
  }).timeout(10000);
});
