import { getDB } from './db'

export async function hasPin() {
  const db = await getDB()
  const sec = await db.get('security', 'pin')
  return !!sec
}

export async function savePinHash(hash) {
  const db = await getDB()
  await db.put('security', { id: 'pin', hash })
}

export async function getPinHash() {
  const db = await getDB()
  const sec = await db.get('security', 'pin')
  return sec ? sec.hash : null
}
