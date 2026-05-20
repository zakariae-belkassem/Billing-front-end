import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TransferStatus } from '../../core/models/transfer.model';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [NzTagModule],
  template: `<nz-tag [nzColor]="color">{{ label }}</nz-tag>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusTagComponent {
  @Input({ required: true }) status!: TransferStatus;

  get color(): string {
    switch (this.status) {
      case 'COMPLETED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PENDING':
      default:
        return 'gold';
    }
  }

  get label(): string {
    switch (this.status) {
      case 'COMPLETED':
        return 'Complete';
      case 'REJECTED':
        return 'Rejete';
      case 'PENDING':
      default:
        return 'En attente';
    }
  }
}
