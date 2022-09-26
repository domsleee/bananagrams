import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsConnectedGuard } from './guards/is-connected.guard';
import { GameComponent } from './pages/game/game.component';
import { HomeComponent } from './pages/home/home.component';
import { JoinComponent } from './pages/join/join.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { LocalComponent } from './pages/local/local.component';
import { RouteNames } from './pages/routes';

const routes: Routes = [
  {path: RouteNames.HOME, component: HomeComponent},
  {path: RouteNames.LOCAL, component: LocalComponent},
  {path: RouteNames.JOIN + '/:id', component: JoinComponent},
  {path: RouteNames.LOBBY + '/:id', component: LobbyComponent, canActivate: [IsConnectedGuard]},
  {path: RouteNames.GAME + '/:id', component: GameComponent, canActivate: [IsConnectedGuard]},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
