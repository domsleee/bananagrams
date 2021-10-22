import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class KeyboardEventsService {
  private readonly keydownHandlerVar;
  private readonly keyupHandlerVar;
  private seenKeys = new Set<string>();
  private attached = false;

  keydownFirstTime = new Subject<string>();

  constructor() {
    this.keydownHandlerVar = this.keydownHandler.bind(this);
    this.keyupHandlerVar = this.keyupHandler.bind(this);
  }

  attachListeners() {
    if (this.attached) throw new Error('already attached!');
    document.addEventListener('keydown', this.keydownHandlerVar);
    document.addEventListener('keyup', this.keyupHandlerVar);
    this.attached = true;
  }

  detachListeners() {
    document.removeEventListener('keydown', this.keydownHandlerVar);
    document.removeEventListener('keyup', this.keyupHandlerVar);
    this.seenKeys = new Set<string>();
    this.attached = false;
  }

  private keydownHandler(event: KeyboardEvent) {
    if (this.seenKeys.has(event.key)) return;
    this.keydownFirstTime.next(event.key);
    this.seenKeys.add(event.key);
  }

  private keyupHandler(event: KeyboardEvent) {
    this.seenKeys.delete(event.key);
  }
}
