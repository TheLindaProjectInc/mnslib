import { Provider, Transaction } from '@metrixcoin/metrilib';
import { ethers } from 'ethers';
import ABI from '../../abi';
import { CONTRACTS } from '../../constants';
import { fromHexAddress } from '../../utils/AddressUtils';
import BaseResolver from './BaseResolver';
import ABIResolver from './profiles/ABIResolver';
import AddrResolver from './profiles/AddrResolver';
import ContentHashResolver from './profiles/ContentHashResolver';
import DNSResolver from './profiles/DNSResolver';
import InterfaceResolver from './profiles/InterfaceResolver';
import NameResolver from './profiles/NameResolver';
import PubkeyResolver from './profiles/PubkeyResolver';
import TextResolver from './profiles/TextResolver';

/**
 * Class which can be used to interact with the PublicResolver
 *
 * @class
 */
export default class PublicResolver
  extends BaseResolver
  implements
    ABIResolver,
    AddrResolver,
    ContentHashResolver,
    DNSResolver,
    InterfaceResolver,
    NameResolver,
    PubkeyResolver,
    TextResolver
{
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].PublicResolver,
      provider,
      ABI.PublicResolver
    );
  }

  async setABI(
    node: string,
    contentType: bigint,
    data: string
  ): Promise<Transaction> {
    const tx = await this.send('setABI(bytes32,uint256,bytes)', [
      node,
      `0x${contentType.toString(16)}`,
      data
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async ABI(
    node: string,
    contentType: bigint
  ): Promise<[contentType: bigint, data: string]> {
    const result = await this.call('ABI(bytes32,uint256)', [
      node,
      `0x${contentType.toString(16)}`
    ]);
    if (result && result.length >= 2) {
      const tup: [contentType: bigint, data: string] = [
        BigInt(result[0].toString()),
        result[1].toString()
      ];
      return tup;
    }
    return [BigInt(0), ''];
  }

  async setAddr(node: string, a: string): Promise<Transaction> {
    const tx = await this.send('setAddr(bytes32,address)', [node, a]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
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
    const tx = await this.send('setAddr(bytes32,uint256,bytes)', [
      node,
      `0x${coinType.toString(16)}`,
      a
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async addr(
    node: string,
    convert: undefined | boolean = false
  ): Promise<string> {
    const result = await this.call('addr(bytes32)', [node]);
    let mrxAddress: string | undefined = result
      ? result.toString()
      : ethers.constants.AddressZero;
    if (convert === true) {
      mrxAddress = fromHexAddress(this.provider.network, mrxAddress);
    }
    return mrxAddress ? mrxAddress : ethers.constants.AddressZero;
  }

  async addrByType(node: string, coinType: bigint): Promise<string> {
    const result = await this.call('addr(bytes32,uint256)', [
      node,
      `0x${coinType.toString(16)}`
    ]);
    if (result) {
      return result.toString();
    }
    return ethers.constants.AddressZero;
  }

  async setContenthash(node: string, hash: string): Promise<Transaction> {
    const tx = await this.send('setContenthash(bytes32,bytes)', [node, hash]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
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

  async setDNSRecords(node: string, data: string): Promise<Transaction> {
    const tx = await this.send('setDNSRecords(bytes32,bytes)', [node, data]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }
  async dnsRecord(
    node: string,
    name: string,
    resource: bigint
  ): Promise<string> {
    const result = await this.call('dnsRecord(bytes32,bytes32,uint16)', [
      node,
      name,
      `0x${resource.toString(16)}`
    ]);
    if (result) {
      return result.toString();
    }
    return '';
  }

  async hasDNSRecords(node: string, name: string): Promise<boolean> {
    const result = await this.call('hasDNSRecords(bytes32,bytes32)', [
      node,
      name
    ]);
    if (result) {
      return result.toString() == 'true';
    }
    return false;
  }

  async clearDNSZone(node: string): Promise<Transaction> {
    const tx = await this.send('clearDNSZone(bytes32)', [node]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async setZoneHash(node: string, hash: string): Promise<Transaction> {
    const tx = await this.send('setZoneHash(bytes32,bytes)', [node, hash]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async zoneHash(node: string): Promise<string> {
    const result = await this.call('zonehash(bytes32)', [node]);
    if (result) {
      return result.toString();
    }
    return '';
  }

  async setInterface(
    node: string,
    interfaceId: string,
    implementer: string
  ): Promise<Transaction> {
    const tx = await this.send('setInterface(bytes32,bytes4,address)', [
      node,
      interfaceId,
      implementer
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async interfaceImplementer(
    node: string,
    interfaceId: string
  ): Promise<string> {
    const result = await this.call('interfaceImplementer(bytes32,bytes4)', [
      node,
      interfaceId
    ]);
    if (result) {
      return result.toString();
    }
    return ethers.constants.AddressZero;
  }

  async setName(node: string, name: string): Promise<Transaction> {
    const tx = await this.send('setName(bytes32,string)', [node, name]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async name(node: string): Promise<string> {
    const result = await this.call('name(bytes32)', [node]);
    if (result) {
      return result.toString();
    }
    return '';
  }

  async setPubkey(node: string, x: string, y: string): Promise<Transaction> {
    const tx = await this.send('setPubkey(bytes32,bytes32,bytes32)', [
      node,
      x,
      y
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async pubkey(node: string): Promise<[x: string, y: string]> {
    const result = await this.call('pubkey(bytes32)', [node]);
    if (result && result.length >= 2) {
      const tup: [string, string] = [
        result[0].toString(),
        result[1].toString()
      ];
      return tup;
    }
    return [ethers.constants.HashZero, ethers.constants.HashZero];
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
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
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
}
