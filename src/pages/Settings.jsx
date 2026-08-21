import { useRef, useState } from 'react'
import { exportAllData, importBackupData } from '../storage/database.js'
import { encodeBackup, decodeBackup } from '../utils/backup.js'
import {
  enableReminders,
  disableReminders,
  notificationsSupported
} from '../utils/reminders.js'
import { SAFETY_NOTE } from '../data/workouts.js'

export default function Settings({ settings, onUpdateSettings, onDataChanged, onBack }) {
  const [code, setCode] = useState(null)
  const [restoreText, setRestoreText] = useState('')
  const [status, setStatus] = useState(null) // {kind:'ok'|'error', text}
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  const remindersOn = !!settings?.reminders

  const toggleReminders = async () => {
    setStatus(null)
    if (remindersOn) {
      await disableReminders()
      onUpdateSettings({ ...settings, reminders: false })
      return
    }
    const result = await enableReminders()
    if (result.ok) {
      onUpdateSettings({ ...settings, reminders: true, reminderMode: result.mode })
      setStatus({
        kind: 'ok',
        text:
          result.mode === 'background'
            ? 'Reminders on — your phone will nudge you daily even when the app is closed.'
            : 'Reminders on. On this device the browser cannot wake the app in the background, so notifications appear when the app is opened or running.'
      })
    } else {
      setStatus({
        kind: 'error',
        text:
          result.mode === 'denied'
            ? 'Notification permission was denied. Enable notifications for this site in your browser settings, then try again.'
            : 'This browser does not support notifications.'
      })
    }
  }

  const makeCode = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const data = await exportAllData()
      const encoded = await encodeBackup(data)
      setCode(encoded)
      try {
        await navigator.clipboard.writeText(encoded)
        setStatus({ kind: 'ok', text: 'Backup code copied to clipboard. Save it somewhere safe (notes, email).' })
      } catch {
        setStatus({ kind: 'ok', text: 'Backup code ready below — long-press to select and copy it.' })
      }
    } catch (err) {
      console.error(err)
      setStatus({ kind: 'error', text: 'Could not create the backup code.' })
    } finally {
      setBusy(false)
    }
  }

  const downloadFile = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `myfitness-backup-${data.exportedAt.slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setStatus({ kind: 'ok', text: 'Backup file downloaded.' })
    } catch (err) {
      console.error(err)
      setStatus({ kind: 'error', text: 'Could not create the backup file.' })
    } finally {
      setBusy(false)
    }
  }

  const restore = async (payloadText) => {
    setBusy(true)
    setStatus(null)
    try {
      const payload = await decodeBackup(payloadText)
      const count = await importBackupData(payload)
      await onDataChanged()
      setRestoreText('')
      setStatus({
        kind: 'ok',
        text: `Restored ${count} workout${count === 1 ? '' : 's'} plus your exercises and settings.`
      })
    } catch (err) {
      console.error(err)
      setStatus({ kind: 'error', text: `Restore failed: ${err.message}` })
    } finally {
      setBusy(false)
    }
  }

  const restoreFromFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => restore(String(reader.result))
    reader.onerror = () => setStatus({ kind: 'error', text: 'Could not read that file.' })
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="fade-in">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back
      </button>
      <h1 className="page-title" style={{ marginBottom: 14 }}>
        Settings
      </h1>

      <div className="card">
        <div className="toggle-row">
          <div>
            <div className="toggle-row__label">Daily reminder</div>
            <p className="empty-note" style={{ marginTop: 2 }}>
              A notification each day with what's on the schedule.
            </p>
          </div>
          <button
            type="button"
            className={`switch ${remindersOn ? 'switch--on' : ''}`}
            onClick={toggleReminders}
            disabled={!notificationsSupported()}
            role="switch"
            aria-checked={remindersOn}
            aria-label="Daily reminder"
          />
        </div>
        {!notificationsSupported() && (
          <p className="empty-note" style={{ marginTop: 10 }}>
            Notifications are not supported in this browser.
          </p>
        )}
        <p className="empty-note" style={{ marginTop: 10 }}>
          Background reminders (app closed) work on Android/Chrome once the app is
          installed to the home screen. iPhones don't allow web apps to schedule
          background notifications without a server, so there they show when you open the
          app.
        </p>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          Backup
        </div>
        <p className="empty-note" style={{ marginBottom: 12 }}>
          All data lives on this device. Save a backup so you can restore everything if
          the phone is reset or you switch devices — no account needed.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="btn btn--primary" onClick={makeCode} disabled={busy}>
            Copy backup code
          </button>
          <button type="button" className="btn btn--secondary" onClick={downloadFile} disabled={busy}>
            Download backup file
          </button>
        </div>
        {code && <div className="code-box" style={{ marginTop: 12 }}>{code}</div>}
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          Restore
        </div>
        <p className="empty-note" style={{ marginBottom: 10 }}>
          Paste a backup code, or pick a backup file. Restoring adds the backed-up
          workouts to this device — nothing already logged here is deleted.
        </p>
        <div className="form-field">
          <textarea
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
            placeholder="MYFIT1.…"
            aria-label="Backup code"
          />
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy || restoreText.trim().length === 0}
            onClick={() => restore(restoreText)}
          >
            Restore from code
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            Restore from file
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={restoreFromFile}
        />
      </div>

      {status && (
        <div className={status.kind === 'ok' ? 'success-note' : 'error-box'} style={{ marginTop: 12 }}>
          {status.text}
        </div>
      )}

      <div className="note-box note-box--safety" style={{ marginTop: 12 }}>
        {SAFETY_NOTE}
      </div>
    </div>
  )
}
