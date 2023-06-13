import { APIProvider } from '@metrixcoin/metrilib';
import { equal } from 'assert';
import { getMNSAddress } from '../../../utils/ContractUtils';
import { MrxRegistrar } from './MrxRegistrar';

describe('MRXRegistrar tests', () => {
  const network = 'MainNet';
  const provider = new APIProvider(network);

  const registrar = new MrxRegistrar(provider);

  it('should match the basenode for .mrx', async () => {
    const baseNode = await registrar.baseNode();
    equal(
      baseNode,
      '0xc47342cbb5c26e3ba5e8293b0ab45469187c57ecfdf5f32b29af8c38eabdd2b2'
    );
  }).timeout(30000);

  it('should match the MNS address', async () => {
    const registry = await registrar.mns();
    equal(registry.replace('0x', '').toLowerCase(), getMNSAddress(network));
  }).timeout(30000);

  it('should return a total supply', async () => {
    const supply = await registrar.totalSupply();
    equal(isNaN(Number(supply)), false);
  }).timeout(30000);

  it('should return "MNS" as symbol', async () => {
    const symbol = await registrar.symbol();
    equal(symbol, 'MNS');
  }).timeout(30000);

  it('should return "Metrix Name Service" as symbol', async () => {
    const name = await registrar.name();
    equal(name, 'Metrix Name Service');
  }).timeout(30000);
});
