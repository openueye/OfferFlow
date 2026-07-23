const DB_NAME = 'OfferFlowDB'
const STORE_NAME = 'resume-files'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('浏览器不支持 IndexedDB'))
      return
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      console.error('[IndexedDB] openDB error:', request.error)
      reject(request.error)
    }
  })
}

export async function saveResumeFile(resumeId, file) {
  console.log('[resume save]', resumeId, file.name, Math.round(file.size / 1024) + 'KB')
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, resumeId)
    tx.oncomplete = () => {
      db.close()
      console.log('[resume save] completed for', resumeId)
      resolve()
    }
    tx.onerror = () => {
      console.error('[resume save] transaction error:', tx.error)
      db.close()
      reject(tx.error)
    }
  })
}

export async function getResumeFile(resumeId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(resumeId)
    request.onsuccess = () => {
      db.close()
      const blob = request.result
      console.log('[resume read]', resumeId, blob ? `blob(${blob.size}B)` : 'null')
      resolve(blob || null)
    }
    request.onerror = () => {
      console.error('[resume read] error:', request.error)
      db.close()
      reject(request.error)
    }
  })
}

export async function deleteResumeFile(resumeId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(resumeId)
    tx.oncomplete = () => {
      db.close()
      console.log('[resume delete] completed for', resumeId)
      resolve()
    }
    tx.onerror = () => {
      console.error('[resume delete] transaction error:', tx.error)
      db.close()
      reject(tx.error)
    }
  })
}
