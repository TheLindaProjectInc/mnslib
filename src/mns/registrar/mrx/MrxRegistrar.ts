import {
  IERC721Enumerable,
  MetrixContract,
  Provider,
  Transaction
} from '@metrixcoin/metrilib';
import { ethers } from 'ethers';
import ABI from '../../../abi';
import { CONTRACTS } from '../../../constants';

/**
 * A registrar that controls '.mrx' names
 * @class
 */
export class MrxRegistrar extends MetrixContract implements IERC721Enumerable {
  constructor(provider: Provider) {
    super(
      CONTRACTS[provider.network].BaseRegistrarImplementation,
      provider,
      ABI.BaseRegistrarImplementation
    );
  }

  async name(): Promise<string> {
    const tokenName = await this.call('name()', []);
    return tokenName ? tokenName.toString() : '';
  }

  async symbol(): Promise<string> {
    const tokenSymbol = await this.call('symbol()', []);
    return tokenSymbol ? tokenSymbol.toString() : '';
  }

  async tokenURI(tokenId: bigint): Promise<string> {
    const uri = await this.call('tokenURI(uint256)', [
      `0x${tokenId.toString(16)}`
    ]);
    return uri ? uri.toString() : '';
  }

  /**
   * Get the MNS address
   * @returns {Promise<string>} the address of the MNS Registry
   */
  async mns(): Promise<string> {
    const mnsAddr = await this.call('mns()', []);
    return mnsAddr ? mnsAddr.toString() : ethers.ZeroAddress;
  }

  /**
   * Get the root node of this registrar
   * @returns {Promise<string>} the root node of this registrar
   */
  async baseNode(): Promise<string> {
    const node = await this.call('baseNode()', []);
    return node ? node.toString() : ethers.ZeroHash;
  }

  async totalSupply(): Promise<bigint> {
    const supply = await this.call('totalSupply()', []);
    const s = BigInt(supply ? supply.toString() : 0);
    return s ? s : BigInt(0);
  }

  async tokenOfOwnerByIndex(owner: string, index: bigint): Promise<string> {
    const token = await this.call('makeCommitmentWithConfig(address,uint256)', [
      owner,
      `0x${index.toString(16)}`
    ]);
    return token ? token.toString() : ethers.ZeroHash;
  }

  async tokenByIndex(index: bigint): Promise<string> {
    const token = await this.call('tokenByIndex(uint256)', [
      `0x${index.toString(16)}`
    ]);
    return token ? token.toString() : ethers.ZeroHash;
  }

  async balanceOf(owner: string): Promise<bigint> {
    const balance = await this.call('balanceOf(address)', [owner]);
    const b = BigInt(balance ? balance.toString() : 0);
    return b ? b : BigInt(0);
  }

  async ownerOf(tokenId: bigint): Promise<string> {
    const owner = await this.call('ownerOf(uint256)', [
      `0x${tokenId.toString(16)}`
    ]);
    return owner ? owner.toString() : ethers.ZeroAddress;
  }

  async safeTransferFrom(
    from: string,
    to: string,
    tokenId: bigint
  ): Promise<Transaction> {
    const tx = await this.send('safeTransferFrom(address,address,uint256)', [
      from,
      to,
      `0x${tokenId.toString(16)}`
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async transferFrom(
    from: string,
    to: string,
    tokenId: bigint
  ): Promise<Transaction> {
    const tx = await this.send('transferFrom(address,address,uint256)', [
      from,
      to,
      `0x${tokenId.toString(16)}`
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async approve(to: string, tokenId: bigint): Promise<Transaction> {
    const tx = await this.send('approve(address,uint256)', [
      to,
      `0x${tokenId.toString(16)}`
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async getApproved(tokenId: bigint): Promise<string> {
    const approved = await this.call('getApproved(uint256)', [
      `0x${tokenId.toString(16)}`
    ]);
    return approved ? approved.toString() : ethers.ZeroAddress;
  }

  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<Transaction> {
    const tx = await this.send('setApprovalForAll(address,bool)', [
      operator,
      `${approved}`
    ]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    const result = await this.call('isApprovedForAll(address,address)', [
      owner,
      operator
    ]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }

  async safeTransferFromData(
    from: string,
    to: string,
    tokenId: bigint,
    data: string
  ): Promise<Transaction> {
    const tx = await this.send(
      'safeTransferFrom(address,address,uint256,bytes)',
      [from, to, `0x${tokenId.toString(16)}`, data]
    );
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    const result = await this.call('supportsInterface(bytes4)', [interfaceId]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }

  // Returns the expiration timestamp of the specified label hash.
  async nameExpires(id: string) {
    const expires = await this.call('nameExpires(uint256)', [id]);
    const ex = BigInt(expires ? expires.toString() : 0);
    return ex ? ex : BigInt(0);
  }

  // Returns true if the specified name is available for registration.
  async available(id: string) {
    //nameExpires(uint256
    const result = await this.call('available(uint256)', [id]);
    if (result) {
      return result.toString() === 'true';
    }
    return false;
  }

  /**
   * Reclaim ownership of a name in MNS, if you own it in the registrar.
   */
  async reclaim(id: string, owner: string): Promise<Transaction> {
    const tx = await this.send('reclaim(uint256,address)', [id, owner]);
    const getReceipts = this.provider.getTxReceipts(tx, this.abi, this.address);
    return {
      txid: tx.txid,
      getReceipts
    };
  }
}
