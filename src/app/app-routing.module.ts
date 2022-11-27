import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { JoinComponent } from './pages/join/join.component';
import { RouteNames } from './pages/routes';

export const routes: Routes = [
  {path: RouteNames.HOME, component: HomeComponent},
  {path: RouteNames.JOIN + '/:id', component: JoinComponent},
  {path: RouteNames.LOBBY, loadChildren: () => import('./lazy-loaded/lobby/lobby.module').then(m => m.LobbyModule) },
  {path: RouteNames.GAME, loadChildren: () => import('./lazy-loaded/game/game.module').then(m => m.GameModule) },
  {path: RouteNames.LOCAL, loadChildren: () => import('./lazy-loaded/local/local.module').then(m => m.LocalModule)},
  {path: '**', redirectTo: RouteNames.HOME}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
