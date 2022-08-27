import { formatsByName } from '@ensdomains/address-encoder';
import { ethers } from 'ethers';
import { namehash } from 'ethers/lib/utils';
import ABI from '../abi';
import { CONTRACTS } from '../constants';
import { fromHexAddress } from './AddressUtils';
import { decodeContenthash, encodeContenthash } from './Content';
import { BaseResolver } from '../mns';
import {
  AddrResolver,
  ContentHashResolver,
  TextResolver
} from '../mns/resolver/profiles';
import {
  MetrixContract,
  NetworkType,
  Provider,
  Transaction
} from '@metrixcoin/metrilib';

const getMNSAddress = (network: NetworkType) => {
  return CONTRACTS[network].MNSRegistryWithFallback;
};

const getResolverContract: (
  address: string,
  provider: Provider
) => MetrixContract = (address: string, provider: Provider) => {
  return new MetrixContract(
    address.replace('0x', '').toLowerCase(),
    provider,
    ABI.PublicResolver,
    undefined
  );
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
    const resolver: AddrResolver = new (class
      extends BaseResolver
      implements AddrResolver
    {
      constructor(provider: Provider) {
        super(resolverAddr.replace('0x', ''), provider, ABI.PublicResolver);
      }
      async setAddr(node: string, a: string): Promise<Transaction> {
        const tx = await this.send('setAddr(bytes32,address)', [node, a]);
        const getReceipts = this.provider.getTxReceipts(
          tx,
          this.abi,
          this.address
        );
        return {
          txid: tx.txid,
          getReceipts
        };
      }

      async setAddrByType(
        node: string,
        coinType: bigint,
        a: string
      ): Promise<Transaction> {
        const tx = await this.send('setAddr(bytes32,uint256,address)', [
          node,
          `0x${coinType.toString(16)}`,
          a
        ]);
        const getReceipts = this.provider.getTxReceipts(
          tx,
          this.abi,
          this.address
        );
        return {
          txid: tx.txid,
          getReceipts
        };
      }

      async addr(node: string): Promise<string> {
        const result = await this.call('addr(bytes32)', [node]);
        if (result) {
          return result.toString();
        }
        return ethers.constants.AddressZero.replace('0x', '');
      }

      async addrByType(node: string, coinType: bigint): Promise<string> {
        const result = await this.call('addr(bytes32,uint256)', [
          node,
          `0x${coinType.toString(16)}`
        ]);
        if (result) {
          return result.toString();
        }
        return ethers.constants.AddressZero.replace('0x', '');
      }
    })(provider);
    const format = formatsByName[key];
    if (!format) {
      return ethers.constants.AddressZero;
    }
    const { coinType, encoder } = formatsByName[key];
    if (!coinType || !encoder) {
      return ethers.constants.AddressZero;
    }
    const addr = await resolver.addrByType(nh, BigInt(coinType));
    if (addr === undefined) return ethers.constants.AddressZero;
    if (addr.toString() === '0x') return ethers.constants.AddressZero;
    if (coinType === 326) {
      const hexAddress = fromHexAddress(
        provider.network,
        addr.toString().slice(2)
      );
      return hexAddress ? hexAddress : ethers.constants.AddressZero;
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
  const resolver: AddrResolver = new (class
    extends BaseResolver
    implements AddrResolver
  {
    constructor(provider: Provider) {
      super(resolverAddr, provider, ABI.PublicResolver);
    }
    async setAddr(node: string, a: string): Promise<Transaction> {
      const tx = await this.send('setAddr(bytes32,address)', [node, a]);
      const getReceipts = this.provider.getTxReceipts(
        tx,
        this.abi,
        this.address
      );
      return {
        txid: tx.txid,
        getReceipts
      };
    }

    async setAddrByType(
      node: string,
      coinType: bigint,
      a: string
    ): Promise<Transaction> {
      const tx = await this.send('setAddr(bytes32,uint256,address)', [
        node,
        `0x${coinType.toString(16)}`,
        a
      ]);
      const getReceipts = this.provider.getTxReceipts(
        tx,
        this.abi,
        this.address
      );
      return {
        txid: tx.txid,
        getReceipts
      };
    }

    async addr(node: string): Promise<string> {
      const result = await this.call('addr(bytes32)', [node]);
      if (result) {
        return result.toString();
      }
      return ethers.constants.AddressZero.replace('0x', '');
    }

    async addrByType(node: string, coinType: bigint): Promise<string> {
      const result = await this.call('addr(bytes32,uint256)', [
        node,
        `0x${coinType.toString(16)}`
      ]);
      if (result) {
        return result.toString();
      }
      return ethers.constants.AddressZero.replace('0x', '');
    }
  })(provider);
  const { decoder, coinType } = formatsByName[key];
  let addressAsBytes;
  if (!address || address === '') {
    addressAsBytes = Buffer.from('');
  } else {
    addressAsBytes = decoder(address);
  }
  return await resolver.setAddrByType(
    nh,
    BigInt(coinType),
    addressAsBytes.toString('hex')
  );
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
    const resolver: ContentHashResolver = new (class
      extends BaseResolver
      implements ContentHashResolver
    {
      constructor(provider: Provider) {
        super(resolverAddr, provider, ABI.PublicResolver);
      }
      async setContenthash(node: string, hash: string): Promise<Transaction> {
        const tx = await this.send('setContenthash(bytes32,bytes)', [
          node,
          hash
        ]);
        const getReceipts = this.provider.getTxReceipts(
          tx,
          this.abi,
          this.address
        );
        return {
          txid: tx.txid,
          getReceipts
        };
      }

      async contenthash(node: string): Promise<string> {
        const result = await this.call('contenthash(bytes32)', [node]);
        if (result) {
          return result.toString();
        }
        return '';
      }
    })(provider);

    const contentHashSignature = ethers.utils
      .solidityKeccak256(['string'], ['contenthash(bytes32)'])
      .slice(0, 10);

    const isContentHashSupported = await resolver.supportsInterface(
      contentHashSignature
    );

    if (isContentHashSupported) {
      const { protocolType, decoded, error } = decodeContenthash(
        await resolver.contenthash(nh)
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
      const value = await resolver.contenthash(nh);
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

const setContenthashWithResolver = async (
  name: string,
  content: string,
  resolverAddr: string,
  provider: Provider
) => {
  let encodedContenthash: string | boolean = content;
  if (parseInt(content, 16) !== 0) {
    encodedContenthash = encodeContenthash(content);
  }
  const resolver: ContentHashResolver = new (class
    extends BaseResolver
    implements ContentHashResolver
  {
    constructor(provider: Provider) {
      super(resolverAddr, provider, ABI.PublicResolver);
    }
    async setContenthash(node: string, hash: string): Promise<Transaction> {
      const tx = await this.send('setContenthash(bytes32,bytes)', [node, hash]);
      const getReceipts = this.provider.getTxReceipts(
        tx,
        this.abi,
        this.address
      );
      return {
        txid: tx.txid,
        getReceipts
      };
    }

    async contenthash(node: string): Promise<string> {
      const result = await this.call('contenthash(bytes32)', [node]);
      if (result) {
        return result.toString();
      }
      return '';
    }
  })(provider);
  return await resolver.setContenthash(namehash(name), `${encodedContenthash}`);
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
    const resolver: TextResolver = new (class
      extends BaseResolver
      implements TextResolver
    {
      constructor(provider: Provider) {
        super(resolverAddr, provider, ABI.PublicResolver);
      }
      async setText(
        node: string,
        key: string,
        value: string
      ): Promise<Transaction> {
        const tx = await this.send('setText(bytes32,string,string)', [
          node,
          key,
          value
        ]);
        const getReceipts = this.provider.getTxReceipts(
          tx,
          this.abi,
          this.address
        );
        return {
          txid: tx.txid,
          getReceipts
        };
      }

      async text(node: string, key: string): Promise<string> {
        const result = await this.call(' text(bytes32,string)', [node, key]);
        if (result) {
          return result.toString();
        }
        return '';
      }
    })(provider);
    return await resolver.text(nh, key);
  } catch (e) {
    console.warn(
      'Error getting text record on the resolver contract, are you sure the resolver address is a resolver contract?'
    );
    return '';
  }
};

const setTextWithResolver = async (
  name: string,
  key: string,
  recordValue: string,
  resolverAddr: string,
  provider: Provider
) => {
  const nh = namehash(name);
  const resolver: TextResolver = new (class
    extends BaseResolver
    implements TextResolver
  {
    constructor(provider: Provider) {
      super(resolverAddr, provider, ABI.PublicResolver);
    }
    async setText(
      node: string,
      key: string,
      value: string
    ): Promise<Transaction> {
      const tx = await this.send('setText(bytes32,string,string)', [
        node,
        key,
        value
      ]);
      const getReceipts = this.provider.getTxReceipts(
        tx,
        this.abi,
        this.address
      );
      return {
        txid: tx.txid,
        getReceipts
      };
    }

    async text(node: string, key: string): Promise<string> {
      const result = await this.call(' text(bytes32,string)', [node, key]);
      if (result) {
        return result.toString();
      }
      return '';
    }
  })(provider);
  return await resolver.setText(nh, key, recordValue);
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
};
