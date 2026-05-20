import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateTransferPayload,
  Transfer,
  UpdateTransferStatusPayload
} from '../models/transfer.model';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/transfers';

  createTransfer(payload: CreateTransferPayload): Observable<Transfer> {
    return this.http.post<Transfer>(this.apiUrl, payload);
  }

  getAllTransfers(): Observable<Transfer[]> {
    return this.http.get<Transfer[]>(this.apiUrl);
  }

  updateStatus(id: number, payload: UpdateTransferStatusPayload): Observable<Transfer> {
    return this.http.put<Transfer>(`${this.apiUrl}/${id}/status`, payload);
  }
}
