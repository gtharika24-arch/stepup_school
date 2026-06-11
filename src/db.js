/**
 * IndexedDB Utilities for Offline Storage
 * Handles local data storage and syncing with server
 */

const DB_NAME = 'SchoolManager';
const DB_VERSION = 1;

// Initialize database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Students store
      if (!db.objectStoreNames.contains('students')) {
        const studentsStore = db.createObjectStore('students', { keyPath: '_id' });
        studentsStore.createIndex('classLevel', 'classLevel', { unique: false });
      }

      // Attendance store
      if (!db.objectStoreNames.contains('attendance')) {
        const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
        attendanceStore.createIndex('date', 'date', { unique: false });
        attendanceStore.createIndex('studentId', 'studentId', { unique: false });
        attendanceStore.createIndex('synced', 'synced', { unique: false });
      }

      // Events store
      if (!db.objectStoreNames.contains('events')) {
        const eventsStore = db.createObjectStore('events', { keyPath: '_id' });
        eventsStore.createIndex('date', 'date', { unique: false });
      }

      // Sync queue for failed requests
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }

      console.log('✅ Database initialized');
    };

    request.onsuccess = () => {
      console.log('✅ Database opened successfully');
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('❌ Database open error:', request.error);
      reject(request.error);
    };
  });
};

// Get database instance
let dbInstance = null;

const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
};

// Save data to local store
export const saveLocal = async (storeName, data) => {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`✅ Saved to ${storeName}:`, data);
        resolve(data);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving to local DB:', error);
  }
};

// Get all data from store
export const getLocal = async (storeName) => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📦 Retrieved from ${storeName}:`, request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting from local DB:', error);
    return [];
  }
};

// Get data by index
export const getLocalByIndex = async (storeName, indexName, value) => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error querying local DB:', error);
    return [];
  }
};

// Delete from local store
export const deleteLocal = async (storeName, key) => {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`🗑️ Deleted from ${storeName}`);
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting from local DB:', error);
  }
};

// Clear entire store
export const clearLocal = async (storeName) => {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`🧹 Cleared ${storeName}`);
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error clearing local DB:', error);
  }
};

// Sync data to server
export const syncToServer = async (endpoint, data) => {
  try {
    if (!navigator.onLine) {
      console.log('⚠️ Offline - queuing request');
      await queueForSync(endpoint, data);
      return { success: false, offline: true };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Sync failed');

    console.log('☁️ Data synced to server');
    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    await queueForSync(endpoint, data);
    return { success: false, error: error.message };
  }
};

// Queue request for later sync
const queueForSync = async (endpoint, data) => {
  try {
    const db = await getDB();
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    store.add({
      endpoint,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('📋 Request queued for sync');
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error queueing sync:', error);
  }
};

// Process sync queue
export const processSyncQueue = async () => {
  if (!navigator.onLine) {
    console.log('⚠️ Still offline - sync queue pending');
    return;
  }

  try {
    const queuedRequests = await getLocal('syncQueue');
    
    for (const request of queuedRequests) {
      try {
        const response = await fetch(request.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });

        if (response.ok) {
          await deleteLocal('syncQueue', request.id);
          console.log('✅ Queued request synced');
        }
      } catch (error) {
        console.log('Retry sync later:', error);
      }
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

// Export data for backup
export const exportData = async () => {
  try {
    const students = await getLocal('students');
    const attendance = await getLocal('attendance');
    const events = await getLocal('events');

    return {
      students,
      attendance,
      events,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting data:', error);
  }
};

// Import data from backup
export const importData = async (data) => {
  try {
    if (data.students) await saveLocal('students', data.students);
    if (data.attendance) await saveLocal('attendance', data.attendance);
    if (data.events) await saveLocal('events', data.events);
    
    console.log('✅ Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Listen for online/offline events
export const setupSyncListener = () => {
  window.addEventListener('online', () => {
    console.log('🟢 Back online - processing sync queue');
    processSyncQueue();
  });

  window.addEventListener('offline', () => {
    console.log('🔴 Offline mode activated');
  });
};