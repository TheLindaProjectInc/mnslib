export default interface ContractResponse {
  address: string;
  executionResult: {
    gasUsed: number;
    excepted: string;
    newAddress: string;
    output: string;
    codeDeposit: number;
    gasRefunded: number;
    depositSize: number;
    gasForDeposit: number;
    exceptedMessage?: string;
  };
  transactionReceipt: {
    stateRoot: string;
    utxoRoot?: string;
    gasUsed: number;
    bloom: string;
    createdContracts?: any[];
    destructedContracts?: any[];
    log: [];
  };
}
