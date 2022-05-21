import {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
} from './utils/ContractUtils';

import { namehash } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import Deployment from './interfaces/Deployment';

const labelhash = (label: string) => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label));
};

export * from './mns';
export * from './mrx';
export * from './types';
export * from './constants';
export * from './provider';

export {
  Deployment,
  namehash,
  labelhash,
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
};
