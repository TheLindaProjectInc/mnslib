/*
 * Copyright 2021 Cryptech Services
 *
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// /////////////////////////////////////////////////////////////////////////////
// MetrixRPC.ts forked from BitcoinRPC2 by loma oopaloopa

import http from 'http';
import { IncomingMessage } from 'http';
import { Semaphore } from 'locks';

import { lhttp_read, lhttp_write } from '../lhttp/lhttp';

export {
  MetrixRPC,
  MetrixRawTx,
  MetrixSigHashType,
  MetrixSignRawTx,
  MetrixRPCNode
};

interface StandardOutput {
  address: string;
  amount: string;
}

interface DataOutput {
  data: string;
}

interface ContractOutput {
  contract: {
    contractAddress: string;
    data: string;
    amount?: number;
    gasLimit?: number;
    gasPrice?: number;
  };
}

// /////////////////////////////////////////////////////////////////////////////

const METRIXRPC_NET_TIMEOUT_MILLIS = 60 * 1000;
const METRIXRPC_MAX_SIMULTANEOUS_RPCS = 5;

// /////////////////////////////////////////////////////////////////////////////

class MetrixRawTx {
  private inputs = '';
  private outputs = '';
  private locktime: number | null = null;

  public addInput(
    txid: string,
    vout: number,
    sequence: number | null = null
  ): void {
    if (this.inputs.length > 0) this.inputs += ', ';
    this.inputs += '{ "txid" : ' + JSON.stringify(txid) + ', "vout" : ' + vout;
    if (sequence != null) this.inputs += ', "Sequence" : ' + sequence;
    this.inputs += ' }';
  }

  public addOutput(output: StandardOutput | DataOutput | ContractOutput): void {
    if (output) if (this.outputs.length > 0) this.outputs += ', ';
    if (
      Object.prototype.hasOwnProperty.call(output, 'address') &&
      Object.prototype.hasOwnProperty.call(output, 'amount')
    ) {
      this.outputs +=
        JSON.stringify((output as StandardOutput).address) +
        ' : ' +
        (output as StandardOutput).amount;
    } else if (Object.prototype.hasOwnProperty.call(output, 'data')) {
      this.outputs +=
        JSON.stringify('data') +
        ' : ' +
        JSON.stringify((output as DataOutput).data);
    } else if (Object.prototype.hasOwnProperty.call(output, 'contract')) {
      this.outputs +=
        JSON.stringify('contract') +
        ' : ' +
        JSON.stringify((output as ContractOutput).contract);
    }
  }

  public setLocktime(locktime: number): void {
    this.locktime = locktime;
  }

  public getJsonParamsStr(): string {
    let params = '[ [ ' + this.inputs + ' ], { ' + this.outputs + ' }';
    if (this.locktime != null) params += ', ' + this.locktime;
    params += ' ]';
    return params;
  }
}

// /////////////////////////////////////////////////////////////////////////////

enum MetrixSigHashType {
  ALL = 'ALL',
  NONE = 'NONE',
  SINGLE = 'SINGLE',
  ALL_ANYONECANPAY = 'ALL|ANYONECANPAY',
  NONE_ANYONECANPAY = 'NONE|ANYONECANPAY',
  SINGLE_ANYONECANPAY = 'SINGLE|ANYONECANPAY'
}

// ////////////////////////////////////////////////////////////////////////////

class MetrixSignRawTx {
  private tx = '';
  private utxos = '';
  private privateKeys = '';
  private sigHashType: string | null = null;

  public setTransaction(tx: string): void {
    this.tx = JSON.stringify(tx);
  }

  public addUTXO(
    txid: string,
    vout: number,
    scriptPubKey: string,
    redeemScript: string | null = null
  ): void {
    if (this.utxos.length > 0) this.utxos += ', ';
    this.utxos +=
      '{ "txid" : ' +
      JSON.stringify(txid) +
      ', "vout" : ' +
      vout +
      ', "scriptPubKey" : ' +
      JSON.stringify(scriptPubKey);
    if (redeemScript != null) {
      this.utxos += ', "redeemScript" : ' + JSON.stringify(redeemScript);
    }
    this.utxos += ' }';
  }

  public addPrivateKey(privateKey: string): void {
    if (this.privateKeys.length > 0) this.privateKeys += ', ';
    this.privateKeys += JSON.stringify(privateKey);
  }

  /* sigHashType must be 1 of:
                           null,
                           "ALL",
                           "NONE",
                           "SINGLE",
                           "ALL|ANYONECANPAY",
                           "NONE|ANYONECANPAY",
                           "SINGLE|ANYONECANPAY"
  */
  public setSigHashType(sigHashType: MetrixSigHashType | null): void {
    this.sigHashType = JSON.stringify(sigHashType);
  }

  public getJsonParamsStr(): string {
    let params = '[ ' + this.tx;
    params += this.utxos.length > 0 ? ', [ ' + this.utxos + ' ]' : ', [ ]';
    const haveKeys = this.privateKeys.length > 0;
    const haveHashType = this.sigHashType && this.sigHashType.length > 0;
    if (haveKeys || haveHashType) {
      params += haveKeys ? ', [ ' + this.privateKeys + ' ]' : ', [ ]';
      if (haveHashType) params += ', ' + this.sigHashType;
    }
    params += ' ]';
    return params;
  }
}

// /////////////////////////////////////////////////////////////////////////////

abstract class MetrixRPC {
  private jsonAccount = '';
  private jsonOptionalAccount = '';
  protected url = '';
  protected authHeader = '';

  protected abstract callDaemon(
    method: string,
    paramsArray: string,
    callback: (e: Error | null, result: any) => void /* eslint-disable-line */
  ): void;

  public constructor(
    account: string | null,
    url: string,
    username: string,
    password: string
  ) {
    this.jsonAccount = MetrixRPC.isEmpty(account)
      ? '""'
      : JSON.stringify(account);
    this.jsonOptionalAccount =
      this.jsonAccount === '""' ? '' : this.jsonAccount;
    this.url = url;
    this.authHeader =
      'Basic ' + Buffer.from(username + ':' + password).toString('base64');
  }

  public setDefaultAccount(account: string | null): MetrixRPC {
    this.jsonAccount = MetrixRPC.isEmpty(account)
      ? '""'
      : JSON.stringify(account);
    this.jsonOptionalAccount =
      this.jsonAccount === '""' ? '' : this.jsonAccount;
    return this;
  }

  protected static isEmpty(x: any /* eslint-disable-line */): boolean {
    return x === null || x === '';
  }

  protected static isString(x: any /* eslint-disable-line */): boolean {
    return typeof x === 'string' || x instanceof String;
  }

  public promiseEncryptWallet(passphrase: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.encryptWallet(passphrase, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public encryptWallet(
    passphrase: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'encryptwallet',
      '[ ' + JSON.stringify(passphrase) + ' ]',
      callback
    );
  }

  public promiseWalletPassphrase(
    passphrase: string,
    timeoutSeconds: number
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.walletPassphrase(
          passphrase,
          timeoutSeconds,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public walletPassphrase(
    passphrase: string,
    timeoutSeconds: number,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'walletpassphrase',
      '[ ' +
        JSON.stringify(passphrase) +
        ', ' +
        JSON.stringify(timeoutSeconds) +
        ' ]',
      callback
    );
  }

  public promiseWalletPassphraseChange(
    oldPassphrase: string,
    newPassphrase: string
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.walletPassphraseChange(
          oldPassphrase,
          newPassphrase,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public walletPassphraseChange(
    oldPassphrase: string,
    newPassphrase: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'walletpassphrasechange',
      '[ ' +
        JSON.stringify(oldPassphrase) +
        ', ' +
        JSON.stringify(newPassphrase) +
        ' ]',
      callback
    );
  }

  public promiseWalletLock(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.walletLock((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public walletLock(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('walletlock', 'null', callback);
  }

  public promiseSetAccount(address: string, account: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.setAccount(
          address,
          account,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public setAccount(
    address: string,
    account: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'setaccount',
      '[ ' + JSON.stringify(address) + ', ' + JSON.stringify(account) + ' ]',
      callback
    );
  }

  public promiseCreateRawTransaction(rawTxObj: MetrixRawTx): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.createRawTransaction(
          rawTxObj,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public createRawTransaction(
    rawTxObj: MetrixRawTx,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    return this.callDaemon(
      'createrawtransaction',
      rawTxObj.getJsonParamsStr(),
      callback
    );
  }

  public promiseSignRawTransaction(
    signRawTxObj: MetrixSignRawTx
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.signRawTransaction(
          signRawTxObj,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public signRawTransaction(
    signRawTxObj: MetrixSignRawTx,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    return this.callDaemon(
      'signrawtransactionwithwallet',
      signRawTxObj.getJsonParamsStr(),
      callback
    );
  }

  public promiseSendRawTransaction(transaction: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.sendRawTransaction(
          transaction,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public sendRawTransaction(
    transaction: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const params = `[ ${JSON.stringify(transaction)} ]`;
    return this.callDaemon('sendrawtransaction', params, callback);
  }

  public promiseDecodeRawTransaction(transaction: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.decodeRawTransaction(
          transaction,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public decodeRawTransaction(
    transaction: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    return this.callDaemon(
      'decoderawtransaction',
      '[ ' + JSON.stringify(transaction) + ' ]',
      callback
    );
  }

  public promiseGetRawTransaction(
    txid: string,
    format: boolean | null
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getRawTransaction(
          txid,
          format,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getRawTransaction(
    txid: string,
    format: boolean | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    let params = '[ ' + JSON.stringify(txid);
    if (format != null) params += format ? ', 1' : ', 0';
    params += ' ]';
    return this.callDaemon('getrawtransaction', params, callback);
  }

  public promiseGetUnconfirmedBalance(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getUnconfirmedBalance((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getUnconfirmedBalance(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getunconfirmedbalance', '[ ]', callback);
  }

  public promiseGetPoolInfo(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getPoolInfo((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getPoolInfo(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getpoolinfo', '[ ]', callback);
  }

  public promiseGetNetworkInfo(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getNetworkInfo((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getNetworkInfo(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getnetworkinfo', '[ ]', callback);
  }

  public promiseValidateAddress(address: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.validateAddress(address, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public validateAddress(
    address: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    if (address !== null) {
      this.callDaemon(
        'validateaddress',
        '[ ' + JSON.stringify(address) + ' ]',
        callback
      );
    } else callback(new Error(), null);
  }

  public promiseGetBalance(paramOptionalAccount: string | null): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBalance(
          paramOptionalAccount,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getBalance(
    paramOptionalAccount: string | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    if (paramOptionalAccount !== null) {
      this.callDaemon(
        'getbalance',
        '[ ' + JSON.stringify(paramOptionalAccount) + ' ]',
        callback
      );
    } else {
      this.callDaemon(
        'getbalance',
        '[ ' + this.jsonOptionalAccount + ' ]',
        callback
      );
    }
  }

  public promiseGetAddressesByAccount(
    paramOptionalAccount: string | null
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getAddressesByAccount(
          paramOptionalAccount,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getAddressesByAccount(
    paramOptionalAccount: string | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    if (paramOptionalAccount !== null) {
      this.callDaemon(
        'getaddressesbyaccount',
        '[ ' + JSON.stringify(paramOptionalAccount) + ' ]',
        callback
      );
    } else {
      this.callDaemon(
        'getaddressesbyaccount',
        '[ ' + this.jsonAccount + ' ]',
        callback
      );
    }
  }

  public promiseGetNewAddress(
    paramOptionalAccount: string | null
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getNewAddress(
          paramOptionalAccount,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getNewAddress(
    paramOptionalAccount: string | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    if (paramOptionalAccount !== null) {
      this.callDaemon(
        'getnewaddress',
        '[ ' + JSON.stringify(paramOptionalAccount) + ' ]',
        callback
      );
    } else {
      this.callDaemon(
        'getnewaddress',
        '[ ' + this.jsonOptionalAccount + ' ]',
        callback
      );
    }
  }

  public promiseGetAddressInfo(address: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getAddressInfo(address, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getAddressInfo(
    address: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'getaddressinfo',
      '[ ' + JSON.stringify(address) + ' ]',
      callback
    );
  }

  public promiseGetTransaction(txid: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getTransaction(txid, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getTransaction(
    txid: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'gettransaction',
      '[ ' + JSON.stringify(txid) + ' ]',
      callback
    );
  }

  public promiseGetTransactionReceipt(txid: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getTransactionReceipt(
          txid,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getTransactionReceipt(
    txid: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'gettransactionreceipt',
      '[ ' + JSON.stringify(txid) + ' ]',
      callback
    );
  }

  public promiseGetTxOut(txid: string, vout: number): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getTxOut(txid, vout, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getTxOut(
    txid: string,
    vout: number,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'gettxout',
      '[ ' + JSON.stringify(txid) + ', ' + vout + ' ]',
      callback
    );
  }

  public promiseGetBestBlockHash(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBestBlockHash((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getBlockHash(
    height: number,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getblockhash', `[ ${height} ]`, callback);
  }

  public promiseGetBlockHash(height: number): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBlockHash(height, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getBestBlockHash(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getbestblockhash', '[ ]', callback);
  }

  public promiseGetBlockCount(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBlockCount((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getBlockCount(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getblockcount', '[ ]', callback);
  }

  public promiseGetBlock(hash: string, verbose: 0 | 1 | 2): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBlock(hash, verbose, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getBlock(
    hash: string,
    verbose: 0 | 1 | 2,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'getblock',
      '[ ' + JSON.stringify(hash) + ', ' + JSON.stringify(verbose) + ' ]',
      callback
    );
  }

  public promiseGetBlockchainInfo(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getBlockchainInfo((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getBlockchainInfo(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getblockchaininfo', '[ ]', callback);
  }

  public promiseGetChainTips(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getChainTips((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getChainTips(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getchaintips', '[ ]', callback);
  }

  public promiseBackupWallet(target: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.backupWallet(target, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public backupWallet(
    target: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'backupwallet',
      '[ ' + JSON.stringify(target) + ' ]',
      callback
    );
  }

  public promiseGetDifficulty(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getDifficulty((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getDifficulty(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getdifficulty', '[ ]', callback);
  }

  public promiseGetWalletInfo(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getWalletInfo((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getWalletInfo(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getwalletinfo', '[ ]', callback);
  }

  public promiseGetInvalid(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getInvalid((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getInvalid(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getinvalid', '[ ]', callback);
  }

  public promiseGetMiningInfo(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getMiningInfo((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getMiningInfo(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getmininginfo', '[ ]', callback);
  }

  public promiseStop(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.stop((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public stop(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('stop', '[ ]', callback);
  }

  public promiseGetStakingStatus(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getStakingStatus((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getStakingStatus(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getstakingstatus', '[ ]', callback);
  }

  public promiseGetStakeSplitThreshold(): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getStakeSplitThreshold((e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public getStakeSplitThreshold(
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('getstakesplitthreshold', '[ ]', callback);
  }

  public promiseSignMessage(address: string, message: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.signMessage(
          address,
          message,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public signMessage(
    address: string,
    message: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'signmessage',
      '[ ' + JSON.stringify(address) + ', ' + JSON.stringify(message) + ' ]',
      callback
    );
  }

  public promiseVerifyMessage(
    address: string,
    signature: string,
    message: string
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.verifyMessage(
          address,
          signature,
          message,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public verifyMessage(
    address: string,
    signature: string,
    message: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const paramsArray =
      '[ ' +
      JSON.stringify(address) +
      ', ' +
      JSON.stringify(signature) +
      ', ' +
      JSON.stringify(message) +
      ' ]';
    this.callDaemon('verifymessage', paramsArray, callback);
  }

  public promiseEstimateFee(blockcount: number): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.estimateFee(blockcount, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public estimateFee(
    blockcount: number,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('estimatefee', '[ ' + blockcount + ' ]', callback);
  }

  public promiseEstimateSmartFee(
    conf_target: number,
    estimate_mode: string | undefined
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.estimateSmartFee(
          conf_target,
          estimate_mode,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public estimateSmartFee(
    conf_target: number,
    estimate_mode: string | undefined,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const params: any[] = [conf_target];
    if (estimate_mode != undefined) params.push(estimate_mode);
    this.callDaemon('estimatesmartfee', JSON.stringify(params), callback);
  }

  public promiseSetTxFee(fee: number): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.setTxFee(fee, (e: Error | null, result: any): void => {
          if (e) reject(e);
          else resolve(result);
        });
      }
    );
  }

  public setTxFee(
    fee: number,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('settxfee', '[ ' + fee + ' ]', callback);
  }

  public promiseSendToAddress(
    address: string,
    ammount: string,
    comment: string
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.sendToAddress(
          address,
          ammount,
          comment,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public sendToAddress(
    address: string,
    ammount: string,
    comment: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const paramsArray =
      '[ ' +
      JSON.stringify(address) +
      ', ' +
      JSON.stringify(ammount) +
      ', ' +
      JSON.stringify(comment) +
      ' ]';
    this.callDaemon('sendtoaddress', paramsArray, callback);
  }

  public promiseSendMany(
    addressesAmmountsObj: any,
    confirmations: number,
    comment: string,
    feeAddressesArray: string[] | string | null
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.sendMany(
          addressesAmmountsObj,
          confirmations,
          comment,
          feeAddressesArray,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public sendMany(
    addressesAmmountsObj: any,
    confirmations: number,
    comment: string,
    feeAddressesArray: string[] | string | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    let paramsArray =
      '[ ' +
      this.jsonAccount +
      ', ' +
      (MetrixRPC.isString(addressesAmmountsObj)
        ? addressesAmmountsObj
        : JSON.stringify(addressesAmmountsObj)) +
      ', ' +
      confirmations +
      ', ' +
      JSON.stringify(comment);
    if (!MetrixRPC.isEmpty(feeAddressesArray)) {
      paramsArray +=
        ', ' +
        (MetrixRPC.isString(feeAddressesArray)
          ? feeAddressesArray
          : JSON.stringify(feeAddressesArray));
    }
    paramsArray += ' ]';
    this.callDaemon('sendmany', paramsArray, callback);
  }

  public promiseListUnspent(
    minConf: number,
    maxConf: number,
    addressesArray: string[]
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.listUnspent(
          minConf,
          maxConf,
          addressesArray,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public listUnspent(
    minConf: number,
    maxConf: number,
    addressesArray: string[],
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'listunspent',
      '[ ' +
        minConf +
        ', ' +
        maxConf +
        ', ' +
        JSON.stringify(addressesArray) +
        ' ]',
      callback
    );
  }

  public promiseGetAddressesByLabel(
    paramOptionalAccount: string | null
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getAddressesByLabel(
          paramOptionalAccount,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public getAddressesByLabel(
    paramOptionalAccount: string | null,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    if (paramOptionalAccount !== null) {
      this.callDaemon(
        'getaddressesbylabel',
        '[ ' + JSON.stringify(paramOptionalAccount) + ' ]',
        callback
      );
    } else {
      this.callDaemon(
        'getaddressesbylabel',
        '[ ' + this.jsonAccount + ' ]',
        callback
      );
    }
  }

  public getHexAddress(
    metrixAddress: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('gethexaddress', JSON.stringify([metrixAddress]), callback);
  }

  public promiseGetHexAddress(metrixAddress: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.getHexAddress(
          metrixAddress,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public fromHexAddress(
    hexAddress: string,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon('fromhexaddress', JSON.stringify([hexAddress]), callback);
  }

  public promiseFromHexAddress(hexAddress: string): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.fromHexAddress(
          hexAddress,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public callContract(
    contrtactAddress: string,
    data: string,
    senderAddress: string,
    gasLimit: string | undefined,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const args = [contrtactAddress, data, senderAddress];
    if (gasLimit) {
      args.push(gasLimit);
    }
    this.callDaemon('callcontract', JSON.stringify(args), callback);
  }

  public promiseCallContract(
    contrtactAddress: string,
    data: string,
    senderAddress: string,
    gasLimit?: string
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.callContract(
          contrtactAddress,
          data,
          senderAddress,
          gasLimit,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public createContract(
    bytecode: string,
    gasLimit: number | string | undefined = 2500000,
    gasPrice: number | string | undefined = 0.00005,
    senderAddress: string,
    broadcast: boolean = true,
    changeToSender: boolean = true,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    const args = [
      bytecode,
      gasLimit,
      gasPrice,
      senderAddress,
      broadcast,
      changeToSender
    ];

    this.callDaemon('createcontract', JSON.stringify(args), callback);
  }

  public promiseCreateContract(
    bytecode: string,
    gasLimit: number | string | undefined,
    gasPrice: number | string | undefined,
    senderAddress: string,
    broadcast?: boolean,
    changeToSender?: boolean
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.createContract(
          bytecode,
          gasLimit,
          gasPrice,
          senderAddress,
          broadcast,
          changeToSender,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public listContracts(
    start: number | string | undefined = 1,
    maxDisplay: number | string | undefined = 20,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'listcontracts',
      '[ ' + start + ', ' + maxDisplay + ' ]',
      callback
    );
  }

  public promiseListContracts(
    start?: number | string,
    maxDisplay?: number | string
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.listContracts(
          start,
          maxDisplay,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }

  public sendToContract(
    contractAddress: string,
    datahex: string,
    amount: number | string | undefined = 0,
    gasLimit: number | string | undefined = 250000,
    gasPrice: number | string | undefined = 0.00005,
    senderAddress: string,
    broadcast: boolean | undefined = true,
    changeToSender: boolean | undefined = true,
    callback: (e: Error | null, result: any /* eslint-disable-line */) => void
  ): void {
    this.callDaemon(
      'sendtocontract',
      JSON.stringify([
        contractAddress,
        datahex,
        amount,
        gasLimit,
        gasPrice,
        senderAddress,
        broadcast,
        changeToSender
      ]),
      callback
    );
  }

  public promiseSendToContract(
    contractAddress: string,
    datahex: string,
    amount: number | string,
    gasLimit: number | string,
    gasPrice: number | string,
    senderAddress: string,
    broadcast?: boolean,
    changeToSender?: boolean
  ): Promise<any> {
    return new Promise<any>(
      (resolve: (result: any) => any, reject: (e: Error) => any): void => {
        this.sendToContract(
          contractAddress,
          datahex,
          amount,
          gasLimit,
          gasPrice,
          senderAddress,
          broadcast,
          changeToSender,
          (e: Error | null, result: any): void => {
            if (e) reject(e);
            else resolve(result);
          }
        );
      }
    );
  }
}

// //////////////////////////////////////////////////////////////////////////////

class MetrixRPCNode extends MetrixRPC {
  private sem = new Semaphore(METRIXRPC_MAX_SIMULTANEOUS_RPCS);

  public constructor(
    account: string | null,
    url: string,
    username: string,
    password: string
  ) {
    super(account, url, username, password);
  }

  protected callDaemon(
    method: string,
    paramsJsonStr: string,
    callback: (e: Error | null, resultObj: any) => any
  ): void {
    const json = `{ "jsonrpc" : "1.0", "id" : "MetrixRPCNode2", "method" : "${method}", "params" : ${paramsJsonStr} }`;
    const jsonBuf = Buffer.from(json, 'utf8');
    const httpOpts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        'Content-Length': jsonBuf.byteLength
      }
    };
    let done = false;
    this.sem.wait((): void => {
      // console.log("SENDING");
      // console.log(json);
      const req = http.request(
        this.url,
        httpOpts,
        (res: IncomingMessage): void => {
          const immediateResult = lhttp_read(
            res,
            0,
            'utf8',
            (e: Error | null, data: string | Buffer[]): void => {
              complete(e, data as string);
            }
          );
          if (immediateResult) complete(null, immediateResult as string);
        }
      );
      req.on('error', (e: Error): void => {
        complete(e, '');
      });
      req.setTimeout(METRIXRPC_NET_TIMEOUT_MILLIS, (): void => {
        complete(
          new Error(
            `Network timeout RPCing wallet at ${
              METRIXRPC_NET_TIMEOUT_MILLIS / 1000
            } seconds.`
          ),
          ''
        );
        req.abort();
      });
      lhttp_write(req, [jsonBuf], null, true, (e: Error | null): void => {
        if (e) complete(e, '');
      });
    });

    const complete = (e: Error | null, resultStr: string): void => {
      if (!done) {
        done = true;
        let resultObj: any = null;
        if (!e) {
          // console.log("RECEIVING");
          // console.log(resultStr);
          try {
            resultObj = JSON.parse(resultStr);
          } catch (jsonError: any) {
            e = jsonError;
            resultObj = resultStr;
            console.log(
              'MetrixRPCNode2 recieived non JSON response. Perhaps due to a bad RPC username and/or password.'
            );
          }
        }
        if (!e) {
          const resErr = resultObj['error'];
          const getValues = (obj: any) => {
            let values: any;
            if (obj instanceof Error) {
              values = {};
              values.message = (obj as Error).message;
              values.stack = (obj as Error).stack;
            } else if (obj instanceof Function) {
              /* eslint-disable-next-line */
              values = `function: ${(obj as Function).name}`;
            } else if (typeof obj === 'object' && obj !== null) {
              values = !Array.isArray(obj) ? {} : [];
              if (Object.entries(obj).length > 0) {
                for (const [key, value] of Object.entries(obj)) {
                  values[key] = getValues(value);
                }
              } else {
                values = obj;
              }
            } else {
              values = obj;
            }
            return values;
          };
          if (resErr) {
            if (resErr instanceof Error) e = resErr;
            else {
              e = new Error(JSON.stringify(getValues(resErr)));
            }
          } else resultObj = resultObj['result'];
        }
        callback(e, resultObj);
        this.sem.signal();
      }
    };
  }
}
