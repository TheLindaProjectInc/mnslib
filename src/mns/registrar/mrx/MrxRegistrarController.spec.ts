import { equal, notEqual } from 'assert';
import { ethers } from 'ethers';
import { APIProvider } from '../../../provider';
import { MrxRegistrarController } from './MrxRegistrarController';

describe('MRXRegistrarController tests', () => {
  const network = 'MainNet';
  const provider = new APIProvider(network);

  const controller = new MrxRegistrarController(provider);

  it('should return a price', async () => {
    const price = await controller.rentPrice(
      'pyropets',
      BigInt(60 * 60 * 24 * 365)
    );
    console.log(`price: ${price.toString()}`);
    equal(isNaN(Number(price)), false);
  }).timeout(5000);

  it('should be a valid name', async () => {
    const valid = await controller.valid('pyropets');
    equal(valid, true);
  }).timeout(5000);

  it('should makeCommitmentWithConfig', async () => {
    const commitment = await controller.makeCommitmentWithConfig(
      'pyropets',
      `0x${controller.address}`,
      ethers.constants.HashZero,
      '0x0f34d660e34ccafac00b463fdd3a80a7437c666d',
      `0x${controller.address}`
    );
    console.log(`commitment: ${commitment}`);
    notEqual(commitment, ethers.constants.HashZero);
  }).timeout(5000);

  it('should be an invalid name', async () => {
    const valid = await controller.valid('test....');
    equal(valid, false);
  }).timeout(5000);
});
