import TransactionReceipt from './TransactionReceipt';

export interface Transaction {
  txid: string;
  getReceipts: Promise<TransactionReceipt[]>;
}
