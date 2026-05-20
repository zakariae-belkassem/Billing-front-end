import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount } from '../models/bank-account.model';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/accounts';

  getAllAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.apiUrl);
  }
}
