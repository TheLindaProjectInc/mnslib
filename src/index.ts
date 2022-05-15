import MNS from './MNS';
import {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract,
} from './utils/ContractUtils';
import APIProvider from './provider/APIProvider';
import RPCProvider from './provider/RPCProvider';
import Web3Provider from './provider/Web3Provider';
import {CONTRACTS} from './constants';
import {namehash} from 'ethers/lib/utils';
import {ethers} from 'ethers';

export default MNS;

const labelhash = (label: string) => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label));
};

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
  CONTRACTS,
};
