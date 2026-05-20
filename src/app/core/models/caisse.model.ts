export interface Caisse {
  id: number;
  date: string;
  montantDepart: number;
  solde: number;
  pdvId: number;
  closed: boolean;
  transactions?: any[];
  reconciliationId: number;
}
