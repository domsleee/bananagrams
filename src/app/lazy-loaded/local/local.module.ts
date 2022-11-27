import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalRoutingModule } from './local-routing.module';
import { LocalComponent } from 'src/app/pages/local/local.component';
import { MatButtonModule } from '@angular/material/button';
import { GameModule } from '../game/game.module';


@NgModule({
  declarations: [
    LocalComponent,
  ],
  imports: [
    CommonModule,
    LocalRoutingModule,
    CommonModule,
    MatButtonModule,
    GameModule
  ]
})
export class LocalModule { }
