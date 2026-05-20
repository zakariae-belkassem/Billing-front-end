export enum OperationType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface Transaction {
  transactionId: number;
  montant: number;
  operationType: OperationType;
  caisseId: number;
  pdvId: number;
}
