/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { type EditLayer } from '../App';

const DB_NAME = 'pixshop-db';
const DB_VERSION = 1;
const STORE_NAME = 'editorStateStore';
const STATE_KEY = 'editorState';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(true);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject(false);
    };
  });
};

export interface EditorState {
    history: EditLayer[][];
    historyIndex: number;
}

export const saveData = (data: EditorState): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(data, STATE_KEY);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const loadData = (): Promise<EditorState | null> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    request.onsuccess = () => {
        resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearData = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
