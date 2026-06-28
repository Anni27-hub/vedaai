'use client'
import { FormEvent, useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import { api } from '@/lib/api'
import { Group } from '@/types'

const emptyForm = { name: '', subject: '', grade: '', studentCount: 0, notes: '' }

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getGroups().then(setGroups).catch(console.error).finally(() => setLoading(false))
  }, [])

  const reset = () => {
    setForm(emptyForm)
    setEditing(null)
    setFormOpen(false)
    setError('')
  }

  const openEdit = (group: Group) => {
    setEditing(group)
    setForm({
      name: group.name,
      subject: group.subject,
      grade: group.grade,
      studentCount: group.studentCount,
      notes: group.notes || '',
    })
    setFormOpen(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      if (editing) {
        const updated = await api.updateGroup(editing._id, form)
        setGroups((items) => items.map((item) => item._id === updated._id ? { ...item, ...updated } : item))
      } else {
        const created = await api.createGroup(form)
        setGroups((items) => [created, ...items])
      }
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save group')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this group?')) return
    await api.deleteGroup(id)
    setGroups((items) => items.filter((item) => item._id !== id))
  }

  const totalStudents = groups.reduce((sum, group) => sum + group.studentCount, 0)
  const totalAssignments = groups[0]?.assignments || 0

  return (
    <div className="flex flex-col h-full">
      <Topbar label="My Groups" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h1 className="font-bold text-base text-gray-900">My Groups</h1>
            </div>
            <p className="text-xs text-gray-500 ml-4">Create and manage the classes you teach.</p>
          </div>
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus size={14} /> New Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Groups', value: groups.length, icon: Users },
            { label: 'Total Students', value: totalStudents, icon: GraduationCap },
            { label: 'Assignments', value: totalAssignments, icon: BookOpen },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{loading ? '-' : value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {formOpen && (
          <form onSubmit={submit} className="card p-5 mb-6 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-gray-900">{editing ? 'Edit Group' : 'Create Group'}</h2>
              <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="input" placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <input className="input" placeholder="Class / Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required />
              <input className="input" type="number" min={0} placeholder="Students" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: Number(e.target.value) })} />
            </div>
            <textarea className="input mt-3 h-20 resize-none" placeholder="Notes, section, board, or batch details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button className="btn-brand mt-4">{editing ? 'Update Group' : 'Create Group'}</button>
          </form>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="card p-10 text-center">
            <Users size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-800">No groups yet</p>
            <p className="text-xs text-gray-500 mt-1">Create a class group to organize students and teaching context.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700">{group.grade}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(group)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                    <button onClick={() => remove(group._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{group.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{group.subject}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><GraduationCap size={12} /> {group.studentCount} Students</span>
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {group.assignments} Assignments</span>
                </div>
                {group.notes && <p className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500 line-clamp-2">{group.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
