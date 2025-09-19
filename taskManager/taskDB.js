export default class taskDB {
  constructor() {
    this.dbName = "taskDB";
    this.storeName = "tasks";
    this.dbVersion = 1;
    this.db = null;
  }

  openDB() {
    return new Promise((res, rej) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("start", "start", { unique: false });
          store.createIndex("end", "end", { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log("db is opened", this.db);
        res(this.db);
      };

      request.onerror = (e) => {
        console.log("DB open error", e.target.error);
        rej(e.target.error);
      };
    });
  }

  getAllTasks() {
    return new Promise((res, rej) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);

      const tasks = [];
      const request = store.openCursor()

      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          tasks.push(cursor.value);
          cursor.continue();
        } else {
          res(tasks);
        }
      };

      request.onerror = (e) => rej(e.target.error);
    });
  }

  addTask(task) {
    return new Promise((res, rej) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(task);

      request.onsuccess = () => res(task);
      request.onerror = (e) => rej(e.target.error);
    });
  }

  deleteTask(id) {
    return new Promise((res, rej) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(id);
      request.onsuccess = () => res(id);
      request.onerror = (e) => rej(e.target.result);
    });
  }
}
