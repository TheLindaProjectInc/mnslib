import { equal } from 'assert';
import { APIProvider } from '../../../provider';
import { getMNSAddress } from '../../../utils/ContractUtils';
import TestRegistrar from './TestRegistrar';

describe('TestRegistrar tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const registrar = new TestRegistrar(provider);

  it('should match the rootnode for .test', async () => {
    const rootNode = await registrar.rootNode();
    equal(
      rootNode,
      '0x04f740db81dc36c853ab4205bddd785f46e79ccedca351fc6dfcbd8cc9a33dd6'
    );
  }).timeout(5000);

  it('should match the MNS address', async () => {
    const registry = await registrar.mns();
    equal(registry.replace('0x', '').toLowerCase(), getMNSAddress(network));
  }).timeout(5000);
});
