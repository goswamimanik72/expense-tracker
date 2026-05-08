import { sha256 } from 'js-sha256'

/**
 * Hash a PIN or password using SHA-256.
 * @param {string} pin
 * @returns {string} hex hash
 */
export function hashPin(pin) {
  if (!pin || typeof pin !== 'string') {
    throw new Error('PIN must be a non-empty string')
  }
  return sha256(pin.trim())
}

/**
 * Verify a plain PIN against a stored hash.
 * @param {string} pin
 * @param {string} storedHash
 * @returns {boolean}
 */
export function verifyPin(pin, storedHash) {
  if (!pin || !storedHash) return false
  return hashPin(pin) === storedHash
}
