import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsConnectedGuard } from './guards/is-connected.guard';
import { HomeComponent } from './pages/home/home.component';
import { JoinComponent } from './pages/join/join.component';
import { RouteNames } from './pages/routes';

const routes: Routes = [
  {path: RouteNames.HOME, component: HomeComponent},
  {path: RouteNames.JOIN + '/:id', component: JoinComponent},
  {path: RouteNames.LOBBY, loadChildren: () => import('./lazy-loaded/lobby/lobby.module').then(m => m.LobbyModule), canActivate: [IsConnectedGuard] },
  {path: RouteNames.GAME, loadChildren: () => import('./lazy-loaded/game/game.module').then(m => m.GameModule), canActivate: [IsConnectedGuard]},
  {path: RouteNames.LOCAL, loadChildren: () => import('./lazy-loaded/game/game.module').then(m => m.GameModule)},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
