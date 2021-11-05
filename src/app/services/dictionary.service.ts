import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { getLogger } from './logger';

const logger = getLogger('dictionary');

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  private dict = new Set<string>();

  constructor(
    private httpClient: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {
    window['fixDictionary'] = () => this.init();
    window['checkWord'] = (word: string) => this.hasWord(word);
    this.init();
  }

  async init() {
    return this.httpClient.get(this.baseHref + 'assets/csw2019.txt', {responseType: 'text'})
      .subscribe(t => {
        this.addAllWords(t.split('\r\n'));
        this.addAllWords(t.split('\n'));
      });
  }

  private addAllWords(arr: string[]) {
    for (let word of arr) {
      this.dict.add(word);
    }
  }

  hasWord(word: string): boolean {
    word = word.toUpperCase();
    logger.debug(`hasWord(${word}) = ${this.dict.has(word)}`);
    return this.dict.has(word);
  }
}
