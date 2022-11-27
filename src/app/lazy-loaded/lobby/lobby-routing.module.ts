import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteNames } from 'src/app/pages/routes';
import { LobbyComponent } from '../../pages/lobby/lobby.component';

const routes: Routes = [
  {path: ':id', component: LobbyComponent},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LobbyRoutingModule { }
