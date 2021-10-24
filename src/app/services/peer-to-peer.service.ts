import { Injectable } from '@angular/core';
import Peer, { PeerJSOption } from 'peerjs';
import { interval, ReplaySubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMessage, MessageData } from '../shared/peer-to-peer/defs';
import { resettable } from '../shared/resettable';
import { getLogger } from './logger';

const logger = getLogger('peer-to-peer.service');
const TIMEOUT_MS = 5000;
const HEROKU_HOST = 'heroku-chess-123.herokuapp.com';
export const DEFAULT_ID = 'default';

@Injectable({
  providedIn: 'root'
})
export class PeerToPeerService {
  private messageSubject = resettable(() => new ReplaySubject<IMessage>(100));
  //private messageSubject: Subject<IMessage> = new ReplaySubject(100);
  private peer: Peer | null = null;

  protected isHost = true;
  protected isConnected = false;
  protected connections: {[key: string]: Peer.DataConnection} = {};

  connectionAdded = new Subject<string>();
  connectionRemoved = new Subject<string>();
  getConnections = () => Object.keys(this.connections);

  constructor() {
  }

  getId = () => this.peer?.id ?? DEFAULT_ID;
  getIsHost = () => this.isHost;
  getIsConnected = () => this.isConnected;
  getMessageObservable = () => this.messageSubject.observable;

  async setupAsHost() {
    this.peer?.destroy();
    this.peer = new Peer(this.getPeerConfig());
    this.isHost = true;
    await this.connectToPeerServer();
    this.isConnected = true;

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.addConnectionIfNotExist(conn.peer, conn);
      })
      conn.on('data', this.messageHandler.bind(this));
      this.attachErrorAndCloseConnEvents(conn);
    });
    this.peer.on('close', () => {
      logger.warn('NOT ACCEPTING INCOMING CONNECTIONS??');
    });
  }

  async setupByConnectingToId(id: string) {
    this.destroy();
    this.peer = new Peer(this.getPeerConfig());
    this.isHost = false;
    await this.connectToPeerServer();

    return new Promise((resolve, reject) => {
      const timeoutSub = interval(TIMEOUT_MS).subscribe(t => {
        reject(`Could not connect after ${TIMEOUT_MS}ms. Is the host ${id} correct?`);
        timeoutSub.unsubscribe();
      });

      logger.info(`connecting to ${id}`);

      const conn = this.peer!.connect(id);
      conn.on('data', (data: IMessage) => {
        this.messageHandler(data);
      });
      conn.on('open', () => {
        logger.info(`connected to ${id}!`);
        this.addConnectionIfNotExist(id, conn);
        this.isConnected = true;
        resolve(true);
        timeoutSub.unsubscribe();
      });
      this.attachErrorAndCloseConnEvents(conn, (err) => {
        reject(err);
        conn.close();
        timeoutSub.unsubscribe();
      });
    });
  }

  getHostId() {
    if (this.isHost) return this.getId();
    return this.getConnections()[0];
  }


  broadcastAndToSelf(data: MessageData, options?: IBroadcastOptions) {
    const message = this.broadcast(data, options);
    this.messageSubject.subject.next(message);
    return message;
  }

  broadcast(data: MessageData, options?: IBroadcastOptions) {
    const from = options?.from ?? this.getId();
    const message: IMessage = {
      from,
      type: 'BROADCAST',
      data
    };
    if (options?.echo) {
      message.echoBroadcast = true;
    }
    for (const key in this.connections) {
      if (key === from && !options?.echo) continue;
      this.sendMessage(key, message);
    }
    return message;
  }

  sendSingleMessage(to: string, data: MessageData) {
    const message: IMessage = {
      from: this.getId(),
      type: 'SINGLE',
      data
    };
    this.sendMessage(to, message);
  }

  dispose() {
    this.destroy()
  }

  private getPeerConfig(): PeerJSOption {
    if (false && !environment.production) {
      return {
        host: 'localhost',
        path: '/myapp',
        port: 9000,
        key: 'peerjs'
      };
    };
    return {
      host: HEROKU_HOST,
      port: 443,
      secure: true
    };
  }

  private connectToPeerServer() {
    return new Promise((resolve, reject) => {
      this.peer!.on('open', (id: string) => {
        logger.info(`I am connected to peer server as (${this.getId()})`);
        resolve(true);
      });
      this.peer!.on('error', (err) => {
        reject(err);
      });
    });
  }

  private attachErrorAndCloseConnEvents(conn: Peer.DataConnection, additionalFn?: (err?: string) => void) {
    conn.on('error', (err) => {
      logger.error(`connection: ${conn.peer} error! ${err}`);
      this.onPeerDisconnected(conn);
      if (additionalFn != null) additionalFn(err);
    });

    this.attachToConnCloseEvents(conn, () => {
      logger.info(`connection: ${conn.peer} closed!`);
      this.onPeerDisconnected(conn);
      if (additionalFn != null) additionalFn();
    });
  }

  private attachToConnCloseEvents(conn: Peer.DataConnection, fn: () => void) {
    conn.on('close', () => fn());
    // @ts-ignore
    conn.on('iceStateChanged', (status: any) => {
      if (status === 'disconnected') {
        fn();
      }
    });
  }

  private onPeerDisconnected(conn: Peer.DataConnection) {
    if (!this.isHost) {
      this.isConnected = false;
    }
    this.deleteConnectionIfExists(conn.peer);
    this.broadcastAndToSelf({
      command: 'DISCONNECTED',
      name: conn.peer
    });
  }

  private destroy() {
    this.peer?.destroy();
    this.isConnected = false;
    this.isHost = false;
    this.messageSubject.reset();
    this.connections = {};
  }

  protected messageHandler(message: IMessage) {
    logger.debug('incomingMessage', message);
    if (this.isHost && message.type === 'BROADCAST') {
      this.broadcast(message.data, {from: message.from, echo: message.echoBroadcast});
    }
    else if (message.data.command === 'DISCONNECTED') {
      this.deleteConnectionIfExists(message.data.name);
    }
    this.messageSubject.subject.next(message);
  }

  private addConnectionIfNotExist(name: string, conn: Peer.DataConnection) {
    if (!(name in this.connections)) {
      logger.info(`new connection! ${name}`);
      this.connections[name] = conn;
      this.connectionAdded.next(name);
    }
  }

  private deleteConnectionIfExists(name: string) {
    if (name in this.connections) {
      delete this.connections[name];
      this.connectionRemoved.next(name);
    }

  }

  private sendMessage(to: string, message: IMessage) {
    if (!(to in this.connections)) {
      if (to === this.getId()) {
        this.messageSubject.subject.next(message);
        return;
      }
      logger.warn(`cant send message ${this.getId()} ==> ${to}, ${message}`);
      return;
    }
    logger.debug(`SEND MESSAGE TO ${to}`, message);
    this.connections[to].send(message);
  }
}

interface IBroadcastOptions {
  echo?: boolean;
  from?: string;
}
