import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsConnectedGuard } from 'src/app/guards/is-connected.guard';
import { RouteNames } from 'src/app/pages/routes';
import { GameComponent } from '../../pages/game/game.component';

export const routes: Routes = [
  {path: ':id', component: GameComponent, canActivate: [IsConnectedGuard]},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
