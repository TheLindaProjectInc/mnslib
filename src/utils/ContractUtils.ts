import { formatsByName } from '@ensdomains/address-encoder';
import { ethers } from 'ethers';
import { namehash } from 'ethers/lib/utils';
import ABI from '../abi';
import { CONTRACTS } from '../constants';
import Provider from '../provider/Provider';
import MetrixContract from '../mrx/MetrixContract';
import { NetworkType } from '../types/NetworkType';
import { fromHexAddress } from './AddressUtils';
import { decodeContenthash, encodeContenthash } from './Content';

const getMNSAddress = (network: NetworkType) => {
  return CONTRACTS[network].MNSRegistryWithFallback;
};

const getResolverContract: (
  address: string,
  provider: Provider
) => MetrixContract = (address: string, provider: Provider) => {
  return new MetrixContract(address, provider, ABI.PublicResolver, undefined);
};

const getMNSContract = (address: string, provider: Provider) => {
  return new MetrixContract(
    address,
    provider,
    ABI.MNSRegistryWithFallback,
    undefined
  );
};

const getReverseRegistrarContract = (address: string, provider: Provider) => {
  return new MetrixContract(address, provider, ABI.ReverseRegistrar, undefined);
};

const getAddrWithResolver = async (
  name: string,
  key: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  try {
    const Resolver = getResolverContract(resolverAddr, provider);
    const format = formatsByName[key];
    if (!format) {
      return ethers.constants.AddressZero;
    }
    const { coinType, encoder } = formatsByName[key];
    if (!coinType || !encoder) {
      return ethers.constants.AddressZero;
    }
    const addr = await Resolver.call('addr(bytes32,uint256)', [
      nh,
      `${coinType}`
    ]);
    if (!addr || addr.toString() === '0x') return ethers.constants.AddressZero;
    if (coinType === 326) {
      return fromHexAddress(provider.network, addr.toString().slice(2));
    }
    return encoder(Buffer.from(addr.toString().slice(2), 'hex'));
  } catch (e) {
    console.log(e);
    console.warn(
      'Error getting addr on the resolver contract, are you sure the resolver address is a resolver contract?'
    );
    return ethers.constants.AddressZero;
  }
};

const setAddrWithResolver = async (
  name: string,
  key: string,
  address: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  const Resolver = getResolverContract(resolverAddr, provider);
  const { decoder, coinType } = formatsByName[key];
  let addressAsBytes;
  if (!address || address === '') {
    addressAsBytes = Buffer.from('');
  } else {
    addressAsBytes = decoder(address);
  }
  return Resolver.send('setAddr(bytes32,uint256,bytes)', [
    nh,
    `0x${BigInt(coinType).toString(16)}`,
    addressAsBytes.toString('hex')
  ]);
};

const getContentWithResolver = async (
  name: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  if (parseInt(resolverAddr, 16) === 0) {
    return ethers.constants.AddressZero;
  }
  try {
    const Resolver = getResolverContract(resolverAddr, provider);
    const contentHashSignature = ethers.utils
      .solidityKeccak256(['string'], ['contenthash(bytes32)'])
      .slice(0, 10);

    const isContentHashSupported = await Resolver.call(
      'supportsInterface(bytes4)',
      [contentHashSignature]
    );

    if (isContentHashSupported?.toString() === 'true') {
      const { protocolType, decoded, error } = decodeContenthash(
        (await Resolver.call('contenthash(bytes32)', [nh]))?.toString()
      );
      if (error) {
        console.log('error decoding', error);
        return {
          value: ethers.constants.AddressZero,
          contentType: 'contenthash'
        };
      }
      return {
        value: `${protocolType}://${decoded}`,
        contentType: 'contenthash'
      };
    } else {
      const value = await Resolver.call('contenthash(bytes32)', [nh]);
      return {
        value: value ? value.toString() : '',
        contentType: 'oldcontent'
      };
    }
  } catch (e) {
    const message =
      'Error getting content on the resolver contract, are you sure the resolver address is a resolver contract?';
    console.warn(message, e);
    return { value: message, contentType: 'error' };
  }
};

const setContenthashWithResolver = (
  name: string,
  content: string,
  resolverAddr: string,
  provider: Provider
) => {
  let encodedContenthash: string | boolean = content;
  if (parseInt(content, 16) !== 0) {
    encodedContenthash = encodeContenthash(content);
  }
  const Resolver = getResolverContract(resolverAddr, provider);
  return Resolver.send('setContenthash(bytes32, bytes)', [
    namehash(name),
    `${encodedContenthash}`
  ]);
};

const getTextWithResolver = async (
  name: string,
  key: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  if (parseInt(resolverAddr, 16) === 0) {
    return '';
  }
  try {
    const Resolver = getResolverContract(resolverAddr, provider);
    const addr = await Resolver.call('text(bytes32, string)', [nh, key]);
    return addr ? addr.toString() : '';
  } catch (e) {
    console.warn(
      'Error getting text record on the resolver contract, are you sure the resolver address is a resolver contract?'
    );
    return '';
  }
};

const setTextWithResolver = (
  name: string,
  key: string,
  recordValue: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  return getResolverContract(resolverAddr, provider).send(
    'setText(bytes32, string, string)',
    [nh, key, recordValue]
  );
};

export {
  getMNSAddress,
  getMNSContract,
  getResolverContract,
  getReverseRegistrarContract,
  getAddrWithResolver,
  setAddrWithResolver,
  getContentWithResolver,
  setContenthashWithResolver,
  getTextWithResolver,
  setTextWithResolver
  //callContractWeb3,
  //callContractAPI,
  //sendToContractWeb3,
};
