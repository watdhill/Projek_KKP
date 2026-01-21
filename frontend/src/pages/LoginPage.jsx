import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import kkpLogo from '../assets/kkp.png'

const roleHome = {
  admin: '/admin',
  operatorEselon1: '/operator-eselon1',
  operatorEselon2: '/operator-eselon2',
  operatorUPT: '/operator-upt'
}

// Map role_id to role key
const getRoleFromId = (roleId) => {
  const roleMap = {
    1: 'admin',
    2: 'operatorEselon1',
    3: 'operatorEselon2',
    4: 'operatorUPT'
  }
  return roleMap[roleId] || 'admin'
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaA, setCaptchaA] = useState(getRandomInt(1, 10));
  const [captchaB, setCaptchaB] = useState(getRandomInt(1, 10));
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const navigate = useNavigate()

  const regenerateCaptcha = () => {
    setCaptchaA(getRandomInt(1, 10));
    setCaptchaB(getRandomInt(1, 10));
    setCaptchaInput('');
    setCaptchaError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    if (!email.includes('@')) {
      setError('Format email tidak valid');
      return;
    }

    if (parseInt(captchaInput) !== captchaA + captchaB) {
      setCaptchaError('Jawaban captcha salah');
      regenerateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Login gagal');
        setLoading(false);
        regenerateCaptcha();
        return;
      }

      // Get role from role_id
      const role = getRoleFromId(result.data.role_id);

      // Store user data di localStorage
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', result.data.email);
      localStorage.setItem('userId', result.data.user_id);
      localStorage.setItem('userName', result.data.nama);
      localStorage.setItem('eselon1_id', result.data.eselon1_id || '');
      localStorage.setItem('eselon2_id', result.data.eselon2_id || '');
      localStorage.setItem('upt_id', result.data.upt_id || '');
      localStorage.setItem('namaEselon1', result.data.nama_eselon1 || '');
      localStorage.setItem('namaEselon2', result.data.nama_eselon2 || '');
      localStorage.setItem('namaUPT', result.data.nama_upt || '');

      // Navigate ke home page sesuai role
      navigate(roleHome[role] || '/admin', { replace: true });
    } catch (error) {
      setError('Terjadi kesalahan saat login: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        minHeight: '540px'
      }}>
        {/* Left Side: Logo */}
        <div style={{
          flex: '1',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          borderRight: '1px solid #f1f5f9'
        }}>
          <img
            src={kkpLogo}
            alt="KKP Logo"
            style={{
              width: '100%',
              maxWidth: '320px',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Right Side: Form */}
        <div style={{
          flex: '1',
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Sistem Informasi Manajemen Aplikasi
            </h1>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '12px',
              color: '#b91c1c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="nama @kkp.com"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  backgroundColor: '#cbd5e180',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#1e293b',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Masukkan password"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    paddingRight: '46px',
                    backgroundColor: '#cbd5e180',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '18px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    color: '#64748b',
                    opacity: loading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>


            {/* Captcha */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>Captcha <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', background: '#f1f5f9', padding: '7px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>{captchaA} + {captchaB} = ?</span>
                <input
                  type='number'
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  required
                  placeholder='Jawaban'
                  style={{ width: '90px', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <button type='button' onClick={regenerateCaptcha} style={{ padding: '7px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', borderRadius: '6px', cursor: 'pointer' }} title='Ganti soal'>↻</button>
              </div>
              {captchaError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{captchaError}</div>}
            </div>

            {/* Forgot Password Link */}

            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
              <span
                onClick={() => navigate('/forgot-password')}
                style={{
                  color: '#00a8e8',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Lupa Password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#94a3b8' : '#00a8e8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 168, 232, 0.2)'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#0096d1')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#00a8e8')}
            >
              {loading ? 'Sedang login...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage