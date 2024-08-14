import {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
} from './utils/ContractUtils';

import labelhash from './utils/labelhash';
import Deployment from './interfaces/Deployment';

export * from './mns';
export * from './constants';

const namehash = require('@ensdomains/eth-ens-namehash').hash; // eslint-disable-line @typescript-eslint/no-require-imports

export {
  Deployment,
  namehash,
  labelhash,
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract
};
