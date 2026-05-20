import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, finalize, interval, timeout } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BankAccount } from '../../core/models/bank-account.model';
import {
  CreateTransferPayload,
  TRANSFER_TYPES,
  TransferType
} from '../../core/models/transfer.model';
import { BankAccountService } from '../../core/services/bank-account.service';
import { TransferService } from '../../core/services/transfer.service';

const differentAccountsValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const source = control.get('sourceAccountNumber')?.value;
  const destination = control.get('destinationAccountNumber')?.value;

  return source && destination && source === destination ? { sameAccount: true } : null;
};

@Component({
  selector: 'app-initiate-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    NzAlertModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzEmptyModule,
    NzFormModule,
    NzGridModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSpinModule
  ],
  templateUrl: './initiate-transfer.component.html',
  styleUrls: ['./initiate-transfer.component.css']
})
export class InitiateTransferComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly bankAccountService = inject(BankAccountService);
  private readonly transferService = inject(TransferService);

  private autoRefreshSub?: Subscription;
  private loadAccountsSub?: Subscription;

  readonly transferTypes = TRANSFER_TYPES;

  readonly transferForm = this.fb.group(
    {
      sourceAccountNumber: [null as string | null, Validators.required],
      destinationAccountNumber: [null as string | null, Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      type: ['INSTANT' as TransferType, Validators.required]
    },
    {
      validators: [differentAccountsValidator]
    }
  );

  accounts: BankAccount[] = [];
  loadingAccounts = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadAccounts();
    this.autoRefreshSub = interval(120000).subscribe(() => this.loadAccounts());
  }

  ngOnDestroy(): void {
    this.autoRefreshSub?.unsubscribe();
    this.loadAccountsSub?.unsubscribe();
  }

  loadAccounts(): void {
    this.loadAccountsSub?.unsubscribe();
    this.loadingAccounts = true;
    this.errorMessage = '';

    this.loadAccountsSub = this.bankAccountService
      .getAllAccounts()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loadingAccounts = false;
        })
      )
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts ?? [];
        },
        error: (error: unknown) => {
          this.accounts = [];
          this.errorMessage = this.extractErrorMessage(
            error,
            'Impossible de charger les comptes bancaires.'
          );
        }
      });
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const rawValue = this.transferForm.getRawValue();

    if (
      !rawValue.sourceAccountNumber ||
      !rawValue.destinationAccountNumber ||
      rawValue.amount === null ||
      rawValue.amount === undefined ||
      !rawValue.type
    ) {
      return;
    }

    const payload: CreateTransferPayload = {
      sourceAccountNumber: rawValue.sourceAccountNumber,
      destinationAccountNumber: rawValue.destinationAccountNumber,
      amount: Number(rawValue.amount),
      description: rawValue.description?.trim() ?? '',
      type: rawValue.type
    };

    this.submitting = true;
    this.transferService
      .createTransfer(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (transfer) => {
          this.successMessage =
            transfer.status === 'COMPLETED'
              ? 'Virement instantane cree et execute avec succes.'
              : 'Virement manuel cree avec succes. Son statut est maintenant en attente.';

          this.transferForm.reset({
            sourceAccountNumber: null,
            destinationAccountNumber: null,
            amount: null,
            description: '',
            type: 'INSTANT'
          });

          this.loadAccounts();
        },
        error: (error: unknown) => {
          this.errorMessage = this.extractErrorMessage(error, 'La creation du virement a echoue.');
        }
      });
  }

  getAccountLabel(account: BankAccount): string {
    return `${account.accountNumber} - ${account.ownerName}`;
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
