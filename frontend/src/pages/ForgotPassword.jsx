
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email) {
      setError('Email wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Gagal mengirim email verifikasi');
      }
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
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
      background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '410px',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '18px',
        padding: '38px 32px 32px 32px',
        boxShadow: '0 8px 32px rgba(80,80,180,0.10)',
        border: '1.5px solid #e0e7ff',
        backdropFilter: 'blur(2px)',
        transition: 'box-shadow 0.2s',
      }}>
        <h2 style={{
          fontWeight: 800,
          fontSize: '25px',
          marginBottom: '14px',
          color: '#3730a3',
          letterSpacing: '0.5px',
          textAlign: 'center',
        }}>LUPA PASSWORD</h2>
        <p style={{
          color: '#64748b',
          fontSize: '15px',
          marginBottom: '22px',
          textAlign: 'center',
        }}>
          MASUKKAN EMAIL YANG TERDAFTAR. KAMI AKAN MENGIRIMKAN LINK VERIFIKASI UNTUK RESET PASSWORD KE EMAIL ANDA.
        </p>
        {success ? (
          <div style={{
            color: '#16a34a',
            marginBottom: '18px',
            fontWeight: 700,
            fontSize: '15px',
            textAlign: 'center',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 8px',
          }}>
            Email verifikasi berhasil dikirim!<br />Silakan cek inbox/spam email Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 700,
              color: '#3730a3',
              fontSize: '15px',
              letterSpacing: '0.2px',
            }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="contoh: user@email.com"
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1.5px solid #c7d2fe',
                borderRadius: '9px',
                fontSize: '15px',
                marginBottom: '16px',
                background: '#f1f5f9',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              disabled={loading}
            />
            {error && <div style={{
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '12px',
              fontWeight: 600,
              textAlign: 'center',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '7px',
              padding: '8px 6px',
            }}>{error.toUpperCase()}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#a5b4fc' : 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px 0 rgba(99,102,241,0.08)',
                marginTop: '2px',
                letterSpacing: '0.2px',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'MENGIRIM...' : 'KIRIM LINK VERIFIKASI'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
