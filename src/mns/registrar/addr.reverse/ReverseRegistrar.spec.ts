import { APIProvider } from '@metrixcoin/metrilib';
import { equal } from 'assert';
import { CONTRACTS } from '../../../constants';
import { getMNSAddress } from '../../../utils/ContractUtils';
import { ReverseRegistrar } from './ReverseRegistrar';

describe('ReverseRegistrar tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const registrar = new ReverseRegistrar(provider);

  it('should match the default reverse resolver', async () => {
    const resolver = await registrar.defaultResolver();
    equal(
      resolver.replace('0x', '').toLowerCase(),
      CONTRACTS[network].DefaultReverseResolver
    );
  }).timeout(10000);

  it('should match the MNS address', async () => {
    const registry = await registrar.mns();
    equal(registry.replace('0x', '').toLowerCase(), getMNSAddress(network));
  }).timeout(10000);
});
