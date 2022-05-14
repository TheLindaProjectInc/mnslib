import {formatsByName} from '@ensdomains/address-encoder';
import {ethers} from 'ethers';
import ABI from '../abi';
import {CONTRACTS} from '../constants';
import Provider from '../interfaces/Provider';
import MetrixContract from '../MetrixContract';
import {NetworkType} from '../types/NetworkType';
import {decodeContenthash, encodeContenthash} from './Content';
import {namehash} from './Namehash';

/*
const callContractAPI = async (
  network: 'MainNet' | 'TestNet',
  contract: string,
  method: string,
  data: string[],
  abi: any[]
) => {
  const iface = new ethers.utils.Interface(abi);
  const encoded = iface.encodeFunctionData(method, data).replace('0x', '');

  try {
    let uri = '';
    switch (network) {
      case 'MainNet':
        uri = 'https://explorer.metrixcoin.com/api';
        break;
      case 'TestNet':
        uri = 'https://testnet-explorer.metrixcoin.com/api';
        break;
      default:
        throw new Error('Invalid Network');
    }
    const response = JSON.parse(
      JSON.stringify(
        await (
          await fetch(`${uri}/contract/${contract}/call?data=${encoded}`)
        ).json()
      )
    );

    if (response) {
      const output = response.executionResult.output;
      const decoded = iface.decodeFunctionResult(method, `0x${output}`);
      return decoded;
    } else {
      // failed to get a response
      console.log('response failed');
    }
  } catch (e) {
    console.log('error!!!');
    console.log(e);
  }
  return undefined;
};
*/
/**
 * Read only call to contract
 *
 * @param contract
 * @param method
 * @param data
 * @param abi
 * @returns response result
 */
/*
const callContractWeb3 = async (
  contract: string,
  method: string,
  data: string[],
  abi: any[]
): Promise<any> => {
  const iface = new ethers.utils.Interface(abi);
  const encoded = iface.encodeFunctionData(method, data).replace('0x', '');
  try {
    const result = (window as any).metrimask.rpcProvider.rawCall(
      'callcontract',
      [contract, encoded.replace('0x', '')]
    );
    const response = (await result).executionResult.output;
    const decoded: ethers.utils.Result = iface.decodeFunctionResult(
      method,
      `0x${response}`
    );
    return decoded;
  } catch (e) {
    console.log('error!!!');
    console.log(e);
  }
  return undefined;
};
*/
/**
 * Write call to contract
 *
 * @param contract
 * @param method
 * @param data
 * @param value
 * @param gasLimit
 * @param gasPrice
 * @param abi
 * @returns response result
 */
/*
const sendToContractWeb3 = async (
  contract: string,
  method: string,
  data: string[],
  value: string = '0',
  gasLimit: number = 250000,
  gasPrice: number = 5000,
  abi: any[]
): Promise<any> => {
  const iface = new ethers.utils.Interface(abi);
  const encoded = iface.encodeFunctionData(method, data).replace('0x', '');
  try {
    const result = await (window as any).metrimask.rpcProvider.rawCall(
      'sendtocontract',
      [contract, encoded.replace('0x', ''), value, gasLimit, gasPrice]
    );
    return result.txid
      ? result.txid
      : ethers.constants.HashZero.replace('0x', '');
  } catch (e) {
    console.log('error!!!');
    console.log(e);
  }
  return undefined;
};
*/
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
  resolverAddr: any,
  provider: Provider
) => {
  const nh = namehash(name);
  try {
    const Resolver = getResolverContract(resolverAddr, provider);
    const {coinType, encoder} = formatsByName[key];
    const addr = await Resolver.call('addr(bytes32,uint256)', [
      nh,
      `${coinType}`,
    ]);
    if (addr === '0x') return ethers.constants.AddressZero;

    return encoder(Buffer.from(addr.slice(2), 'hex'));
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
  resolverAddr: any,
  provider: Provider
) => {
  const nh = namehash(name);
  const Resolver = getResolverContract(resolverAddr, provider);
  const {decoder, coinType} = formatsByName[key];
  let addressAsBytes;
  if (!address || address === '') {
    addressAsBytes = Buffer.from('');
  } else {
    addressAsBytes = decoder(address);
  }
  return Resolver.send('setAddr(bytes32,uint256,bytes)', [
    nh,
    `0x${BigInt(coinType).toString(16)}`,
    addressAsBytes.toString('hex'),
  ]);
};

const getContentWithResolver = async (
  name: string,
  resolverAddr: any,
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

    if (isContentHashSupported) {
      const {protocolType, decoded, error} = decodeContenthash(
        await Resolver.call('contenthash(bytes32)', [nh])
      );
      if (error) {
        console.log('error decoding', error);
        return {
          value: ethers.constants.AddressZero,
          contentType: 'contenthash',
        };
      }
      return {
        value: `${protocolType}://${decoded}`,
        contentType: 'contenthash',
      };
    } else {
      const value = await Resolver.call('contenthash(bytes32)', [nh]);
      return {
        value,
        contentType: 'oldcontent',
      };
    }
  } catch (e) {
    const message =
      'Error getting content on the resolver contract, are you sure the resolver address is a resolver contract?';
    console.warn(message, e);
    return {value: message, contentType: 'error'};
  }
};

const setContenthashWithResolver = (
  name: string,
  content: string,
  resolverAddr: any,
  provider: Provider
) => {
  let encodedContenthash: string | boolean = content;
  if (parseInt(content, 16) !== 0) {
    encodedContenthash = encodeContenthash(content);
  }
  const Resolver = getResolverContract(resolverAddr, provider);
  return Resolver.send('setContenthash(bytes32, bytes)', [
    namehash(name),
    `${encodedContenthash}`,
  ]);
};

const getTextWithResolver = async (
  name: string,
  key: string,
  resolverAddr: any,
  provider: Provider
) => {
  const nh = namehash(name);
  if (parseInt(resolverAddr, 16) === 0) {
    return '';
  }
  try {
    const Resolver = getResolverContract(resolverAddr, provider);
    const addr = await Resolver.call('text(bytes32, string)', [nh, key]);
    return addr;
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
  resolverAddr: any,
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
  setTextWithResolver,
  //callContractWeb3,
  //callContractAPI,
  //sendToContractWeb3,
};
