import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

function Profile() {
  const { isAuthenticated, currentUser, checkAuth } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchProfile()
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/user-api/profile')
      setProfile(res.data.payload)
      setUsername(res.data.payload.username)
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!username.trim()) { toast.error('Username cannot be empty'); return }
    setSaving(true)
    try {
      const res = await axios.put('/user-api/profile', { username: username.trim() })
      setProfile(res.data.payload)
      await checkAuth() // refresh currentUser in store
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-24 text-slate-400">Loading…</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-sm text-slate-500 hover:text-orange-500 mb-6 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <p className="text-lg font-bold text-slate-800">{profile?.username}</p>
          <p className="text-sm text-slate-400">{profile?.email}</p>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-2 ${
            profile?.usertype === 'admin'
              ? 'bg-purple-100 text-purple-600'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {profile?.usertype}
          </span>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
            <input
              type="text"
              value={profile?.usertype || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-400 bg-slate-50 text-sm cursor-not-allowed capitalize"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || username.trim() === profile?.username}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setUsername(profile?.username || '')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm hover:border-slate-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Account info */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 space-y-1">
          <p>Member since: {new Date(profile?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Account status: <span className={profile?.isActive ? 'text-green-500' : 'text-red-400'}>{profile?.isActive ? 'Active' : 'Deactivated'}</span></p>
        </div>
      </div>
    </div>
  )
}

export default Profile
