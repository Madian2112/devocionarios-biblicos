import { openDB } from 'idb';
import type { DeepStudy } from '../interfaces/deep-study';

const DB_NAME = 'deep-studies-cache';
const STORE_NAME = 'deep-studies';
const USER_STORE = 'user-studies';

interface DeepStudyCache {
  getDeepStudy: (id: string) => Promise<DeepStudy | undefined>;
  saveDeepStudy: (study: DeepStudy) => Promise<void>;
  removeDeepStudy: (id: string) => Promise<void>;
  getDeepStudiesByUser: (userId: string) => Promise<DeepStudy[]>;
  clearDeepStudiesCache: () => Promise<void>;
}

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      // Almacén principal para estudios
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Almacén para mapeo usuario-estudios
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'userId' });
        userStore.createIndex('studyIds', 'studyIds', { unique: false });
      }
    },
  });
};

export const deepStudyCache: DeepStudyCache = {
  async getDeepStudy(id: string): Promise<DeepStudy | undefined> {
    const db = await initDB();
    return db.get(STORE_NAME, id);
  },

  async saveDeepStudy(study: DeepStudy): Promise<void> {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME, USER_STORE], 'readwrite');

    // Guardar el estudio
    await tx.objectStore(STORE_NAME).put(study);

    // Actualizar el mapeo usuario-estudios
    const userStore = tx.objectStore(USER_STORE);
    const userStudies = await userStore.get(study.userId) || { userId: study.userId, studyIds: [] };
    if (!userStudies.studyIds.includes(study.id)) {
      userStudies.studyIds.push(study.id);
      await userStore.put(userStudies);
    }

    await tx.done;
  },

  async removeDeepStudy(id: string): Promise<void> {
    const db = await initDB();
    const study = await this.getDeepStudy(id);
    if (!study) return;

    const tx = db.transaction([STORE_NAME, USER_STORE], 'readwrite');

    // Eliminar el estudio
    await tx.objectStore(STORE_NAME).delete(id);

    // Actualizar el mapeo usuario-estudios
    const userStore = tx.objectStore(USER_STORE);
    const userStudies = await userStore.get(study.userId);
    if (userStudies) {
      userStudies.studyIds = userStudies.studyIds.filter((studyId: string) => studyId !== id);
      await userStore.put(userStudies);
    }

    await tx.done;
  },

  async getDeepStudiesByUser(userId: string): Promise<DeepStudy[]> {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const userIndex = store.index('userId');

    return userIndex.getAll(userId);
  },

  async clearDeepStudiesCache(): Promise<void> {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME, USER_STORE], 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.objectStore(USER_STORE).clear();
    await tx.done;
  },
};