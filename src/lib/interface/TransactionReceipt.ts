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
  createdContracts: any[];
  destructedContracts: any[];
  log: any[];
}
