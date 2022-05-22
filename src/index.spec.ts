import { equal } from 'assert';
import { MNS, Name } from './mns';
import { APIProvider } from './provider';
import { getMNSAddress } from './utils/ContractUtils';

describe('mnslib tests', () => {
  const network = 'TestNet';
  const provider = new APIProvider(network);

  const mns = new MNS(network, provider, getMNSAddress(network));

  const first = 'first.mrx';
  const name: Name = mns.name(first);

  it('should return expected TestNet MRX address', async () => {
    const address = await name.getAddress('MRX');
    equal(address, 'maTQfd4w7mqCzGL32RgBFMYY9ehCmjLEGf');
  }).timeout(5000);

  it('should return expected TestNet owner', async () => {
    const owner = await name.getOwner();
    equal(
      owner.toLowerCase().replace('0x', ''),
      'c87bb8ab63de99a58a5339217c4a1c92f0fbfefe'
    );
  }).timeout(5000);

  it('should return expected TestNet name given Ethereum checksum address', async () => {
    const addrName = await mns.getName(
      '0xC87bB8Ab63De99A58a5339217C4A1C92f0FBFEFe'
    );
    equal(addrName, first);
  }).timeout(5000);

  it('should return expected TestNet name given hex address', async () => {
    const addrName = await mns.getName(
      'c87bb8ab63de99a58a5339217c4a1c92f0fbfefe'
    );
    equal(addrName, first);
  }).timeout(5000);
});
