import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteNames } from 'src/app/pages/routes';
import { GameComponent } from '../../pages/game/game.component';

const routes: Routes = [
  {path: ':id', component: GameComponent},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
