import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { HomeComponent } from './pages/home/home.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { GameComponent } from './pages/game/game.component';
import { LocalComponent } from './pages/local/local.component';
import { FormsModule } from '@angular/forms';
import { JoinComponent } from './pages/join/join.component';
import { BoardContainerComponent } from './components/board-container/board-container.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    HomeComponent,
    LobbyComponent,
    GameComponent,
    LocalComponent,
    JoinComponent,
    BoardContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
