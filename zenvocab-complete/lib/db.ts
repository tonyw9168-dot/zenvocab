import Dexie, { Table } from 'dexie';

export interface Word {
  id?: number;
  word: string;
  learned: boolean;
  aiContent?: {
    example: string;
    exampleTranslation: string;
    mnemonic: string;
  };
  createdAt: Date;
  learnedAt?: Date;
}

export class ZenVocabDB extends Dexie {
  words!: Table<Word>;

  constructor() {
    super('ZenVocabDB');
    this.version(1).stores({
      words: '++id, word, learned, createdAt'
    });
  }
}

export const db = new ZenVocabDB();
