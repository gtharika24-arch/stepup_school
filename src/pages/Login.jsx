import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('admin@school.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState('admin')
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const chooseRole = (role) => {
    setSelectedRole(role)
    setError('')

    if (role === 'admin') {
      setEmail('admin@school.com')
      setPassword('')
    } else {
      setEmail('member@school.com')
      setPassword('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    if (login(email, password)) {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password')
      setPassword('')
    }
  }

  return (
    <div className="login-page-shell">
      <div className="login-panel">
        <aside className="login-brand-panel">
          <p className="eyebrow"></p>
          <h1>STEP UP Play School</h1>
          <p className="login-brand-copy">School Management System</p>
        </aside>

        <section className="login-box">
          <p className="eyebrow">Sign in</p>
          <h2>Choose your role</h2>

            <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => chooseRole('admin')}
            >
               Admin
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'member' ? 'active' : ''}`}
              onClick={() => chooseRole('member')}
            >
               Member
            </button>
          </div>

          <p className="role-hint">Click a role to fill the login details for that account.</p>

          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Enter password for ${selectedRole === 'admin' ? 'admin' : 'member'} account`}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Login
          </button>
          </form>

          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <ul>
              <li>Member: member@school.com / member123</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
