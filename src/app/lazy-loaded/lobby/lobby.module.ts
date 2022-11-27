import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyRoutingModule } from './lobby-routing.module';
import { LobbyComponent } from '../../pages/lobby/lobby.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    LobbyComponent
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    FormsModule,
    MatButtonModule
  ]
})
export class LobbyModule { }
