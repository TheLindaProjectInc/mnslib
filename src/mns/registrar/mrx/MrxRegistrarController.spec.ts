import { equal } from 'assert';
import { APIProvider } from '../../../provider';
import { getMNSAddress } from '../../../utils/ContractUtils';
import MrxRegistrarController from './MrxRegistrarController';

describe('MRXRegistrarController tests', () => {
  const network = 'MainNet';
  const provider = new APIProvider(network);

  const controller = new MrxRegistrarController(provider);

  it('should return a price', async () => {
    const price = await controller.rentPrice(
      'test',
      BigInt(60 * 60 * 24 * 365)
    );
    equal(isNaN(Number(price)), false);
  }).timeout(5000);
  it('should be a valid name', async () => {
    const valid = await controller.valid('test');
    equal(valid, true);
  }).timeout(5000);

  it('should be an invalid name', async () => {
    const valid = await controller.valid('test....');
    equal(valid, false);
  }).timeout(5000);
});
