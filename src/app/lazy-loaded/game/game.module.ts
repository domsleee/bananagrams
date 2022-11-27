import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from '../../pages/game/game.component';
import { BoardComponent } from '../../components/board/board.component';
import { BoardContainerComponent } from '../../components/board-container/board-container.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    GameComponent,
    BoardComponent,
    BoardContainerComponent
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatButtonModule,
  ],
  exports: [
    BoardComponent,
    BoardContainerComponent
  ]
})
export class GameModule { }
