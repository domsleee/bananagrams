import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsConnectedGuard } from 'src/app/guards/is-connected.guard';
import { RouteNames } from 'src/app/pages/routes';
import { LobbyComponent } from '../../pages/lobby/lobby.component';

export const routes: Routes = [
  {path: ':id', component: LobbyComponent, canActivate: [IsConnectedGuard]},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LobbyRoutingModule { }
