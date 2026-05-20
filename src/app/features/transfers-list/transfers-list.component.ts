import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, finalize, interval, timeout } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Transfer, TransferStatus } from '../../core/models/transfer.model';
import { TransferService } from '../../core/services/transfer.service';
import { StatusTagComponent } from '../../shared/status-tag/status-tag.component';

@Component({
  selector: 'app-transfers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    NzAlertModule,
    NzButtonModule,
    NzCardModule,
    NzEmptyModule,
    NzGridModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    StatusTagComponent
  ],
  templateUrl: './transfers-list.component.html',
  styleUrls: ['./transfers-list.component.css']
})
export class TransfersListComponent implements OnInit, OnDestroy {
  private readonly transferService = inject(TransferService);

  private autoRefreshSub?: Subscription;
  private loadTransfersSub?: Subscription;

  transfers: Transfer[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  updatingId: number | null = null;
  updatingStatus: 'COMPLETED' | 'REJECTED' | null = null;

  ngOnInit(): void {
    this.loadTransfers();
    this.autoRefreshSub = interval(120000).subscribe(() => this.loadTransfers());
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
    this.loadTransfersSub?.unsubscribe();
  }

  loadTransfers(): void {
    this.loadTransfersSub?.unsubscribe();
    this.loading = true;
    this.errorMessage = '';

    this.loadTransfersSub = this.transferService
      .getAllTransfers()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (transfers) => {
          this.transfers = [...(transfers ?? [])].sort((a, b) => b.id - a.id);
        },
        error: (error: unknown) => {
          this.transfers = [];
          this.errorMessage = this.extractErrorMessage(
            error,
            'Impossible de charger la liste des virements.'
          );
        }
      });
  }

  updateStatus(id: number, status: 'COMPLETED' | 'REJECTED'): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.updatingId = id;
    this.updatingStatus = status;

    this.transferService
      .updateStatus(id, { status })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.updatingId = null;
          this.updatingStatus = null;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage =
            status === 'COMPLETED'
              ? 'Le virement a ete valide avec succes.'
              : 'Le virement a ete rejete avec succes.';
          this.loadTransfers();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(
            error,
            'La mise a jour du statut du virement a echoue.'
          );
        }
      });
  }

  countByStatus(status: TransferStatus): number {
    return this.transfers.filter((transfer) => transfer.status === status).length;
  }

  pendingTransfers(): Transfer[] {
    return this.transfers.filter((transfer) => transfer.status === 'PENDING');
  }

  toNumber(value: number | string | null | undefined): number {
    return Number(value ?? 0);
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if ((error as { name?: string } | null)?.name === 'TimeoutError') {
      return 'Le serveur met trop de temps a repondre. Verifie le backend puis clique sur Rafraichir.';
    }

    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message;
      }
    }

    return fallback;
  }
}
