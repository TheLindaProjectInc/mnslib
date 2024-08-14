import { APIProvider } from '@metrixcoin/metrilib';
import { equal } from 'assert';
import { CONTRACTS } from './constants';
import { MNS, Name } from './mns';
import { getMNSAddress, getMNSContract } from './utils/ContractUtils';

describe('mnslib tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const mns = new MNS(network, provider, getMNSAddress(network));

  const first = 'first.mrx';
  const name: Name = mns.name(first);

  it('should have a record', async () => {
    const mnsContract = getMNSContract(
      CONTRACTS[network].MNSRegistryWithFallback,
      provider
    );
    const recordExists = await mnsContract.call('recordExists(bytes32)', [
      name.hash
    ]);
    const exists = recordExists ? recordExists.toString() === 'true' : false;
    equal(exists, true);
  }).timeout(30000);

  it('should have a ttl', async () => {
    const ttl = await name.getTTL();
    equal(!isNaN(ttl), true);
  }).timeout(30000);

  it('should return expected TestNet MRX address', async () => {
    const address = await name.getAddress('MRX');
    equal(address, 'maTQfd4w7mqCzGL32RgBFMYY9ehCmjLEGf');
  }).timeout(30000);

  it('should return expected TestNet address', async () => {
    const address = await name.getAddress();
    equal(address, '0x0aC0B5E95A1F9717811B9cEebCb6855d02f638b3');
  }).timeout(30000);

  it('should return expected TestNet owner', async () => {
    const owner = await name.getOwner();
    equal(
      owner.toLowerCase().replace('0x', ''),
      '0ac0b5e95a1f9717811b9ceebcb6855d02f638b3'
    );
  }).timeout(30000);

  it('should return expected TestNet name given Ethereum checksum address', async () => {
    const addrName = await mns.getName(
      '0xC87bB8Ab63De99A58a5339217C4A1C92f0FBFEFe'
    );
    equal(addrName, first);
  }).timeout(30000);

  it('should return expected TestNet name given hex address', async () => {
    const addrName = await mns.getName(
      'c87bb8ab63de99a58a5339217c4a1c92f0fbfefe'
    );
    equal(addrName, first);
  }).timeout(30000);
});
