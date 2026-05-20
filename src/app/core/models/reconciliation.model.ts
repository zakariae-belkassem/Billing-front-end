import { Caisse } from './caisse.model';


export interface Reconciliation {
  id: number;
  caisse: Caisse;
  totalDebit: number;
  totalCredit: number;
  isCorrect: boolean;
}
