import {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
} from './utils/ContractUtils';

import { namehash } from 'ethers/lib/utils';
import labelhash from './utils/labelhash';
import Deployment from './interfaces/Deployment';

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
