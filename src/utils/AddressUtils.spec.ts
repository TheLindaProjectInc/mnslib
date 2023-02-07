import { equal } from 'assert';
import { fromHexAddress, toHexAddress } from './AddressUtils';

const hex = '1006ab418af315023717b240b84e7cb31d3e6d98';
const bs58 = 'M9Mu2sGhrxzvE56RaUUvLh3hPFBQyUrqin';
const network = 'MainNet';
describe('AddressUtils tests', () => {
  it('should get a base58 address from hex address', async () => {
    const b58 = fromHexAddress(network, hex);
    equal(bs58, b58);
  }).timeout(60000);
  it('should get a hex address from base58 address', async () => {
    const h = toHexAddress(bs58);
    equal(hex, h);
  }).timeout(60000);
});
