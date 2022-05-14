import MNS from './MNS';
import {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract,
} from './utils/ContractUtils';
import {labelhash, namehash} from './utils/Namehash';
import APIProvider from './provider/APIProvider';
import RPCProvider from './provider/RPCProvider';
import Web3Provider from './provider/Web3Provider';

export default MNS;

export {
  namehash,
  labelhash,
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract,
  APIProvider,
  RPCProvider,
  Web3Provider,
};
