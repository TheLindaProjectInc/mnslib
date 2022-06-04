import { ethers } from 'ethers';
import ABI from '../../abi';
import { CONTRACTS } from '../../constants';
import { TransactionReceipt } from '../../mrx';
import { Provider } from '../../provider';
import BaseResolver from './BaseResolver';
import ABIResolver from './profiles/ABIResolver';
import AddrResolver from './profiles/AddrResolver';
import ContentHashResolver from './profiles/ContentHashResolver';
import DNSResolver from './profiles/DNSResolver';
import InterfaceResolver from './profiles/InterfaceResolver';
import NameResolver from './profiles/NameResolver';
import PubkeyResolver from './profiles/PubkeyResolver';
import TextResolver from './profiles/TextResolver';

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
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setABI(bytes32,uint256,bytes)', [
      node,
      `0x${contentType.toString(16)}`,
      data
    ]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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

  async setAddr(node: string, a: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('setAddr(bytes32,address)', [node, a]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async setAddrByType(
    node: string,
    coinType: bigint,
    a: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setAddr(bytes32,uint256,address)', [
      node,
      `0x${coinType.toString(16)}`,
      a
    ]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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

  async setContenthash(
    node: string,
    hash: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setContenhash(bytes32,bytes)', [node, hash]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async contenthash(node: string): Promise<string> {
    const result = await this.call('contenthash(bytes32)', [node]);
    if (result) {
      return result.toString();
    }
    return '';
  }

  async setDNSRecords(
    node: string,
    data: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setDNSRecords(bytes32,bytes)', [node, data]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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

  async clearDNSZone(node: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('clearDNSZone(bytes32)', [node]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async setZoneHash(node: string, hash: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('setZoneHash(bytes32,bytes)', [node, hash]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setInterface(bytes32,bytes4,address)', [
      node,
      interfaceId,
      implementer
    ]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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
    return ethers.constants.AddressZero.replace('0x', '');
  }

  async setName(node: string, name: string): Promise<TransactionReceipt[]> {
    const tx = await this.send('setName(bytes32,string)', [node, name]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async name(node: string): Promise<string> {
    const result = await this.call('name(bytes32)', [node]);
    if (result) {
      return result.toString();
    }
    return '';
  }

  async setPubkey(
    node: string,
    x: string,
    y: string
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setPubkey(bytes32,bytes32,bytes32)', [
      node,
      x,
      y
    ]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
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
  ): Promise<TransactionReceipt[]> {
    const tx = await this.send('setText(bytes32,string,string)', [
      node,
      key,
      value
    ]);
    return await this.provider.getTxReceipts(tx, this.abi, this.address);
  }

  async text(node: string, key: string): Promise<string> {
    const result = await this.call(' text(bytes32,string)', [node, key]);
    if (result) {
      return result.toString();
    }
    return '';
  }
}
