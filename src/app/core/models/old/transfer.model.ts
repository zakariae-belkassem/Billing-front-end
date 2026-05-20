import { BankAccount } from './bank-account.model';

export type TransferStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';
export type TransferType = 'INSTANT' | 'MANUAL';

export interface Transfer {
  id: number;
  sourceAccount: BankAccount;
  destinationAccount: BankAccount;
  amount: number | string;
  description?: string;
  status: TransferStatus;
  createdAt: string;
  type: TransferType;
}

export interface CreateTransferPayload {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string;
  type: TransferType;
}

export interface UpdateTransferStatusPayload {
  status: 'COMPLETED' | 'REJECTED';
}

export const TRANSFER_TYPES: Array<{ label: string; value: TransferType }> = [
  { label: 'INSTANT', value: 'INSTANT' },
  { label: 'MANUAL', value: 'MANUAL' }
];