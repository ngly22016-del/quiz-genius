
import { Question, RegisteredUser, QuizSet, QuizAttempt } from '../types';

const DB_NAME = 'QuizGeniusDB';
const DB_VERSION = 1;

export class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('questions')) db.createObjectStore('questions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'username' });
        if (!db.objectStoreNames.contains('quizSets')) db.createObjectStore('quizSets', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('attempts')) db.createObjectStore('attempts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('curriculum')) db.createObjectStore('curriculum', { keyPath: 'type' });
      };
      request.onsuccess = (event: any) => { this.db = event.target.result; resolve(); };
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  private getStore(name: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('DB not initialized');
    return this.db.transaction(name, mode).objectStore(name);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCurriculum(type: string): Promise<any[]> {
    return new Promise((resolve) => {
      const request = this.getStore('curriculum').get(type);
      request.onsuccess = () => resolve(request.result?.items || []);
      request.onerror = () => resolve([]);
    });
  }

  async saveCurriculum(type: string, items: any[]): Promise<void> {
    await this.save('curriculum', { type, items });
  }
}

export const db = new DBService();
