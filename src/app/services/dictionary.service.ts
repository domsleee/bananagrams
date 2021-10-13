import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  private dict = new Set<string>();

  constructor(
    private httpClient: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {
    console.log('dictionary init');
    this.init();
  }

  async init() {
    return this.httpClient.get(this.baseHref + 'assets/csw2019.txt', {responseType: 'text'})
      .subscribe(t => {
        const spl = t.split('\r\n');
        for (let i = 2; i < spl.length; ++i) this.dict.add(spl[i]);
      });
  }

  hasWord(word: string): boolean {
    word = word.toUpperCase();
    console.log(word, this.dict.has(word));
    return this.dict.has(word);
  }
}
