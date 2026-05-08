import { useState, useEffect } from 'react'
import { hasPin, getPinHash, savePinHash } from '../db/securityDb'
import { hashPin, verifyPin } from '../utils/pinHash'

export default function LockScreen({ onUnlock }) {
  const [mode, setMode] = useState('loading') // loading | setup | locked
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState(1) // for setup: 1 = enter pin, 2 = confirm
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkPinStatus() {
      const exists = await hasPin()
      setMode(exists ? 'locked' : 'setup')
    }
    checkPinStatus()
  }, [])

  function handleNumClick(num) {
    if (error) setError('')
    if (mode === 'setup') {
      if (step === 1 && pin.length < 4) setPin(p => p + num)
      if (step === 2 && confirmPin.length < 4) setConfirmPin(p => p + num)
    } else {
      if (pin.length < 4) setPin(p => p + num)
    }
  }

  function handleBackspace() {
    if (error) setError('')
    if (mode === 'setup') {
      if (step === 1) setPin(p => p.slice(0, -1))
      if (step === 2) setConfirmPin(p => p.slice(0, -1))
    } else {
      setPin(p => p.slice(0, -1))
    }
  }

  async function handleSubmit() {
    if (mode === 'setup') {
      if (step === 1) {
        if (pin.length !== 4) {
          setError('PIN must be 4 digits')
          return
        }
        setStep(2)
      } else if (step === 2) {
        if (confirmPin !== pin) {
          setError('PINs do not match')
          setConfirmPin('')
          return
        }
        await savePinHash(hashPin(pin))
        onUnlock()
      }
    } else if (mode === 'locked') {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits')
        return
      }
      const storedHash = await getPinHash()
      if (verifyPin(pin, storedHash)) {
        onUnlock()
      } else {
        setError('Incorrect PIN')
        setPin('')
      }
    }
  }

  useEffect(() => {
    if (mode === 'setup' && step === 1 && pin.length === 4) handleSubmit()
    if (mode === 'setup' && step === 2 && confirmPin.length === 4) handleSubmit()
    if (mode === 'locked' && pin.length === 4) handleSubmit()
  }, [pin, confirmPin]) // auto-submit when 4 digits reached

  if (mode === 'loading') return <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>

  const currentInput = mode === 'setup' && step === 2 ? confirmPin : pin
  const title = mode === 'setup' 
    ? (step === 1 ? 'Setup Security PIN' : 'Confirm your PIN')
    : 'Enter PIN to Unlock'

  return (
    <div className="lock-screen" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: 'var(--bg-primary)', padding: 'var(--space-xl)'
    }}>
      <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>{mode === 'setup' ? '🔒' : '🔐'}</div>
        <h2>{title}</h2>
        {error && <p style={{ color: 'var(--accent-danger)', marginTop: 'var(--space-sm)' }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: currentInput.length > i ? 'var(--accent-primary)' : 'var(--bg-card)',
            border: `2px solid ${currentInput.length > i ? 'var(--accent-primary)' : 'var(--border-light)'}`,
            transition: 'all 0.2s ease'
          }}></div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)', width: '100%', maxWidth: '300px' 
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} className="btn btn-ghost" style={{ fontSize: '1.5rem', width: '70px', height: '70px', borderRadius: '50%' }} onClick={() => handleNumClick(num.toString())}>
            {num}
          </button>
        ))}
        <button className="btn btn-ghost" style={{ fontSize: '1.2rem', width: '70px', height: '70px', borderRadius: '50%' }} onClick={() => { setPin(''); setConfirmPin(''); setStep(1); }}>
          Clear
        </button>
        <button className="btn btn-ghost" style={{ fontSize: '1.5rem', width: '70px', height: '70px', borderRadius: '50%' }} onClick={() => handleNumClick('0')}>
          0
        </button>
        <button className="btn btn-ghost" style={{ fontSize: '1.2rem', width: '70px', height: '70px', borderRadius: '50%' }} onClick={handleBackspace}>
          ⌫
        </button>
      </div>

      {mode === 'setup' && step === 2 && (
        <button className="btn btn-ghost" style={{ marginTop: 'var(--space-xl)' }} onClick={() => { setStep(1); setConfirmPin(''); setPin(''); }}>
          Start Over
        </button>
      )}
    </div>
  )
}
