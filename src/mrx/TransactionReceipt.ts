export default interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  outputIndex: number;
  from: string;
  to: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  contractAddress: string;
  excepted: string;
  exceptedMessage: string;
  stateRoot: string;
  utxoRoot: string;
  createdContracts: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  destructedContracts: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  log?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  logs?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  confirmations?: number;
}
