import { Component, OnInit } from '@angular/core';
import { PlayerModel } from 'src/app/models/player-model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

}
