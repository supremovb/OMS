import { openDB } from "idb";
import { db, isOnline } from "../firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Collections to support
const COLLECTIONS = ["payments", "employees", "services", "loyalty_customers"];

const DB_NAME = "mad-auto-care-offline";
const DB_VERSION = 1;

// Open IndexedDB
export async function getIDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const col of COLLECTIONS) {
        if (!db.objectStoreNames.contains(col)) {
          db.createObjectStore(col, { keyPath: "id", autoIncrement: false });
        }
      }
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "key", autoIncrement: false });
      }
    }
  });
}

// CRUD for local cache
export async function getAllLocal(col: string) {
  const idb = await getIDB();
  return await idb.getAll(col);
}
export async function setLocal(col: string, obj: any) {
  const idb = await getIDB();
  await idb.put(col, obj);
}
export async function deleteLocal(col: string, id: string) {
  const idb = await getIDB();
  await idb.delete(col, id);
}

// Queue for sync
export async function queueSync(action: "add" | "update" | "delete", col: string, obj: any) {
  const idb = await getIDB();
  await idb.put("syncQueue", { key: `${col}:${obj.id}`, action, col, obj });
}

let syncing = false;

// Simple event system for sync status
const syncListeners: ((status: "start" | "end") => void)[] = [];
export function onSyncStatus(listener: (status: "start" | "end") => void) {
  syncListeners.push(listener);
}
function emitSyncStatus(status: "start" | "end") {
  syncing = status === "start";
  syncListeners.forEach(fn => fn(status));
}

// Expose sync status for UI
export function isSyncing() {
  return syncing;
}

// Sync local changes to Firebase when online
export async function syncToFirebase() {
  emitSyncStatus("start");
  if (!isOnline()) {
    emitSyncStatus("end");
    return;
  }
  const idb = await getIDB();
  const queue = await idb.getAll("syncQueue");
  for (const item of queue) {
    try {
      if (item.action === "add") {
        const { id: offlineId, ...rest } = item.obj;

        // Check for duplicate by createdAt, customerName, and price
        let alreadyExists = false;
        if (offlineId && typeof offlineId === "string" && offlineId.startsWith("offline-")) {
          const colSnap = await getDocs(collection(db, item.col));
          alreadyExists = colSnap.docs.some(docSnap => {
            const data = docSnap.data();
            return (
              data.createdAt === rest.createdAt &&
              data.customerName === rest.customerName &&
              data.price === rest.price
            );
          });
        }

        if (!alreadyExists) {
          const addResult = await addDoc(collection(db, item.col), rest);
          // Remove old offline record (avoid duplicate)
          if (offlineId) {
            await idb.delete(item.col, offlineId);
          }
          // Save new record locally with Firestore ID and without the old id field
          await idb.put(item.col, { ...rest, id: addResult.id });
        } else {
          // If already exists, just remove the offline record and syncQueue entry
          if (offlineId) {
            await idb.delete(item.col, offlineId);
          }
        }
        await idb.delete("syncQueue", item.key);
      } else if (item.action === "update") {
        await updateDoc(doc(db, item.col, item.obj.id), item.obj);
        await idb.delete("syncQueue", item.key);
      } else if (item.action === "delete") {
        await deleteDoc(doc(db, item.col, item.obj.id));
        await idb.delete("syncQueue", item.key);
      }
    } catch {
      // If sync fails, keep the item in the queue for next attempt
    }
  }
  emitSyncStatus("end");
}

// Download latest from Firebase and update local cache
export async function refreshLocalFromFirebase(col: string) {
  if (!isOnline()) return;
  const snap = await getDocs(collection(db, col));
  const idb = await getIDB();
  for (const docSnap of snap.docs) {
    await idb.put(col, { id: docSnap.id, ...docSnap.data() });
  }
}

// Listen for online event to trigger sync
window.addEventListener("online", () => {
  emitSyncStatus("start");
  Promise.all(COLLECTIONS.map(col => refreshLocalFromFirebase(col)))
    .then(() => syncToFirebase())
    .finally(() => emitSyncStatus("end"));
});
