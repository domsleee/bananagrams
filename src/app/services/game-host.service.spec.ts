import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createPeers } from '../mocks/peer-to-peer-helpers';
import { PeerToPeerServiceMock } from '../mocks/peer-to-peer.service.mock';
import { defaultProviders } from '../mocks/test-helpers.spec';
import { PlayerModel } from '../models/player-model';
import { BoardAlgorithmsService } from './board-algorithms.service';

import { GameHostService } from './game-host.service';
import { GameService } from './game.service';
import { InvalidSquareFinderService } from './invalid-square-finder.service';
import { LocalStorageService } from './local-storage.service';
import { NavigationService } from './navigation.service';
import { ParamOverrideService } from './param-override.service';
import { PeerToPeerService } from './peer-to-peer.service';

function getGameService(peer: PeerToPeerService): GameService {
  return new GameService(peer,
    TestBed.inject(InvalidSquareFinderService),
    TestBed.inject(BoardAlgorithmsService),
    TestBed.inject(LocalStorageService),
    TestBed.inject(NavigationService),
  );
}

describe('GameHostService', () => {
  let service: GameHostService;
  let gameService1: GameService;
  let gameService2: GameService;
  let peers: PeerToPeerServiceMock[];

  beforeEach(() => {
    peers = createPeers(1);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        ...defaultProviders,
        { provide: PeerToPeerService, useValue: peers[0] },
      ]
    });
    service = TestBed.inject(GameHostService);
    gameService1 = TestBed.inject(GameService);
    gameService2 = getGameService(peers[1]);

    jasmine.clock().install();
    jasmine.clock().mockDate();

    gameService1.initFromPeerToPeer();
    gameService1.updatePlayer('abc');
    gameService2.initFromPeerToPeer();
    gameService2.updatePlayer('def');
    flushMessages();

    expect(gameService1.state.players[0].name).toBe('abc');
    expect(gameService2.state.players[0].name).toBe('def');
    expect(gameService1.state.players.length).toBe(2);
    expect(gameService2.state.players.length).toBe(2);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  })

  function flushMessages() {
    for (let i = 0; i < 10; ++i) jasmine.clock().tick(2 * 1000);
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('player rejoins, then player loses', () => {
    TestBed.inject(ParamOverrideService).setupOverrides({
      tiles: 'CCCCC',
      numTiles: 2
    });
    service.startGame();
    flushMessages();

    expect(gameService1.state.tilesRemaining).toBe(1);

    const client1Player = gameService2.getPlayerById('client1Id');
    expect(client1Player.totalTiles).toBe(2);
    client1Player.boardState.getSquareFromId(0).dropIndex = 0;
    client1Player.boardState.getSquareFromId(0).letter = 'C';
    client1Player.boardState.getSquareFromId(1).dropIndex = 1;
    client1Player.boardState.getSquareFromId(1).letter = 'C';

    peers[1].peerIdOverride = 'client1IdNew';
    gameService2.rejoinAsPlayer(new PlayerModel('client1Id'));
    flushMessages();
    
    expect(gameService1.state.tilesRemaining).toBe(1);
    gameService2.claimSuccess();
    flushMessages();
    expect(client1Player.isEliminated).toBeTrue();
    expect(gameService1.state.tilesRemaining).toBe(3, 'the tiles remaining should have carried over');
  });

  it('ingame works as expected', () => {
    service.startGame();
    flushMessages();

    expect(gameService1.state.inGame).toBe(true);
    service.returnToLobby();
    flushMessages();
    expect(gameService1.state.inGame).withContext('should not be in game').toBe(false);
  })
});
