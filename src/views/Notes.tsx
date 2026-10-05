import { NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ACTIONS, PHASES } from '../data/content'
import { useStore } from '../store'
import type { Note, PhaseId } from '../types'
import { EmptyState, Field, Modal, PageTitle, SaveIndicator, TextArea, TextInput, useConfirm } from '../components/ui'
import { uid } from '../utils'

const newNote = (): Note => ({ id: uid(), title: '', body: '', phase: '', actionId: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

export default function Notes({ onOpenAction }: { onOpenAction: (id: string) => void }) {
  const { state, update } = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const confirm = useConfirm()

  const actionNotes = ACTIONS.filter((a) => state.actions[a.id]?.notes?.trim())
  const ql = q.toLowerCase()
  const notes = [...state.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(ql))
  const shownActionNotes = actionNotes.filter((a) => !q || `${a.title} ${state.actions[a.id].notes}`.toLowerCase().includes(ql))

  const save = (n: Note) => {
    const v = { ...n, updatedAt: new Date().toISOString() }
    update((s) => ({ ...s, notes: s.notes.some((x) => x.id === n.id) ? s.notes.map((x) => x.id === n.id ? v : x) : [...s.notes, v] }))
    setEditing(null)
  }

  const tag = (n: Note) => {
    const a = ACTIONS.find((x) => x.id === n.actionId)
    if (a) return `Action ${String(a.number).padStart(2, '0')}: ${a.title}`
    const ph = PHASES.find((x) => x.id === n.phase)
    return ph ? `Phase ${ph.number}: ${ph.name}` : null
  }

  return (
    <div>
      <PageTitle eyebrow="THINK ON PAPER" title="My Notes">
        <button className="btn-primary" onClick={() => setEditing(newNote())}><Plus size={18} /> Add note</button>
      </PageTitle>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <label htmlFor="note-search" className="sr-only">Search notes</label>
          <input id="note-search" type="search" className="field pl-10" placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <SaveIndicator />
      </div>

      {state.notes.length === 0 && actionNotes.length === 0 ? (
        <EmptyState icon={<NotebookPen />} title="No notes yet" body="Capture ideas, sales conversations or lessons as you go. You can attach a note to a phase or an action."
          action={<button className="btn-pink" onClick={() => setEditing(newNote())}>Write your first note</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((n) => (
            <article key={n.id} className="card flex flex-col p-5">
              {tag(n) && <p className="label-caps mb-1 !text-accent">{tag(n)}</p>}
              <h2 className="text-lg font-bold">{n.title || 'Untitled note'}</h2>
              <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-muted">{n.body}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-xs text-muted">Edited {new Date(n.updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                <div className="flex gap-1">
                  <button className="rounded-full p-2 hover:bg-bg" aria-label={`Edit ${n.title || 'note'}`} onClick={() => setEditing(n)}><Pencil size={16} /></button>
                  <button className="rounded-full p-2 hover:bg-bg hover:text-danger" aria-label={`Delete ${n.title || 'note'}`}
                    onClick={() => confirm.ask({ title: 'Delete this note?', body: 'This note will be removed. This can’t be undone.', confirmLabel: 'Delete note', danger: true, run: () => update((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== n.id) })) })}><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
          {shownActionNotes.map((a) => (
            <article key={a.id} className="flex flex-col rounded-card border-bold border-dashed border-ink/40 bg-surface p-5">
              <p className="label-caps mb-1 !text-accent">Written inside Action {String(a.number).padStart(2, '0')}</p>
              <h2 className="text-lg font-bold">{a.title}</h2>
              <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-muted">{state.actions[a.id].notes}</p>
              <button className="mt-auto self-start pt-4 text-sm font-bold underline underline-offset-4" onClick={() => onOpenAction(a.id)}>Edit in action</button>
            </article>
          ))}
          {q && notes.length === 0 && shownActionNotes.length === 0 && <p className="text-muted">No notes match “{q}”.</p>}
        </div>
      )}

      {editing && <NoteForm note={editing} onCancel={() => setEditing(null)} onSave={save} />}
      {confirm.node}
    </div>
  )
}

function NoteForm({ note, onSave, onCancel }: { note: Note; onSave: (n: Note) => void; onCancel: () => void }) {
  const [n, setN] = useState(note)
  const set = (p: Partial<Note>) => setN((x) => ({ ...x, ...p }))
  const actions = ACTIONS.filter((a) => !n.phase || a.phase === n.phase)
  return (
    <Modal open onClose={onCancel} title={note.title ? 'Edit note' : 'New note'} wide>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(n) }}>
        <Field label="Title" htmlFor="n-title"><TextInput id="n-title" value={n.title} onChange={(v) => set({ title: v })} placeholder="Give it a short name" /></Field>
        <Field label="Note" htmlFor="n-body"><TextArea id="n-body" rows={7} value={n.body} onChange={(v) => set({ body: v })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Attach to phase" htmlFor="n-phase">
            <select id="n-phase" className="field" value={n.phase} onChange={(e) => set({ phase: e.target.value as PhaseId | '', actionId: '' })}>
              <option value="">No phase</option>
              {PHASES.map((p) => <option key={p.id} value={p.id}>Phase {p.number}: {p.name}</option>)}
            </select>
          </Field>
          <Field label="Attach to action" htmlFor="n-action">
            <select id="n-action" className="field" value={n.actionId} onChange={(e) => { const a = ACTIONS.find((x) => x.id === e.target.value); set({ actionId: e.target.value, phase: a ? a.phase : n.phase }) }}>
              <option value="">No action</option>
              {actions.map((a) => <option key={a.id} value={a.id}>{String(a.number).padStart(2, '0')} {a.title}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!n.title.trim() && !n.body.trim()}>Save note</button>
        </div>
      </form>
    </Modal>
  )
}
