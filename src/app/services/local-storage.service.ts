import { Injectable } from '@angular/core';

const PREFIX = 'bananagrams-';

export interface ILocalState {
  previousIds: string[]
};

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  localState: ILocalState;

  constructor() {
    this.localState = this.getLocalState();
  }

  private getLocalState(): ILocalState {
    const item = localStorage.getItem(PREFIX);
    if (item === null) return this.getDefaultLocalState();
    try {
      return JSON.parse(item);
    } catch(e) {
      return this.getDefaultLocalState();
    }
  }

  private getDefaultLocalState() {
    return {
      previousIds: []
    };
  }

  updateLocalState() {
    localStorage.setItem(PREFIX, JSON.stringify(this.localState));
  }
}