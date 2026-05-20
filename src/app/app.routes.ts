import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'initiate-transfer'
  },
  {
    path: 'initiate-transfer',
    loadComponent: () =>
      import('./features/initiate-transfer/initiate-transfer.component').then(
        (module) => module.InitiateTransferComponent
      )
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./features/transfers-list/transfers-list.component').then(
        (module) => module.TransfersListComponent
      )
  },
  {
    path: '**',
    redirectTo: 'initiate-transfer'
  }
];
