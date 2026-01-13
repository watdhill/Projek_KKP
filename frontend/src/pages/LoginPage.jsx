import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const roleHome = {
  admin: '/admin',
  operatorEselon1: '/operator-eselon1',
  operatorEselon2: '/operator-eselon2'
}

// Map role_id to role key
const getRoleFromId = (roleId) => {
  const roleMap = {
    1: 'admin',
    2: 'operatorEselon1',
    3: 'operatorEselon2'
  }
  return roleMap[roleId] || 'admin'
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    if (!email.includes('@')) {
      setError('Format email tidak valid')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/users/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || 'Login gagal')
        setLoading(false)
        return
      }

      // Get role from role_id
      const role = getRoleFromId(result.data.role_id)

      // Store user data di localStorage
      localStorage.setItem('userRole', role)
      localStorage.setItem('userEmail', result.data.email)
      localStorage.setItem('userId', result.data.user_id)
      localStorage.setItem('userName', result.data.nama)
      localStorage.setItem('namaEselon1', result.data.nama_eselon1 || '')
      localStorage.setItem('namaEselon2', result.data.nama_eselon2 || '')

      // Navigate ke home page sesuai role
      navigate(roleHome[role] || '/admin', { replace: true })
    } catch (error) {
      setError('Terjadi kesalahan saat login: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f5d8c 0%, #1a7fa0 100%)',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        padding: '48px 40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#0f5d8c',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Portal KKP
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '14px',
            margin: '0',
            fontWeight: '400'
          }}>
            Sistem Informasi Manajemen Aplikasi
          </p>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 14px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            color: '#b91c1c', 
            fontSize: '13px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1e293b'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%',
                padding: '11px 13px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: loading ? '#f9fafb' : '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0f5d8c'
                e.target.style.boxShadow = '0 0 0 3px rgba(15, 93, 140, 0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="nama@example.com"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1e293b'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '11px 13px',
                  paddingRight: '40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  backgroundColor: loading ? '#f9fafb' : '#ffffff',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0f5d8c'
                  e.target.style.boxShadow = '0 0 0 3px rgba(15, 93, 140, 0.08)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  color: '#64748b',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px 14px', 
              background: loading ? '#cbd5e1' : '#0f5d8c',
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '14px',
              transition: 'background-color 0.2s ease',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#0d4a6d'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#0f5d8c'
              }
            }}
          >
            {loading ? 'Sedang login...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage