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
export * from './constants';

export {
  Deployment,
  namehash,
  labelhash,
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
};
