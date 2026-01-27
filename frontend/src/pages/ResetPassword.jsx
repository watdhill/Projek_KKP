import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const token = searchParams.get('token');

  const validatePassword = (pw) => {
    // Minimal 8 karakter, huruf besar, kecil, angka, simbol, tanpa spasi
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/.test(pw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setError('');
    setSuccess(false);
    if (!newPassword || !confirmPassword) {
      setError('Password baru dan konfirmasi wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sesuai');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password minimal 8 karakter dan wajib mengandung huruf besar, huruf kecil, angka, dan simbol (tanpa spasi)');
      return;
    }
    if (!token) {
      setError('Token reset password tidak ditemukan');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message || 'Gagal reset password');
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
        background: 'rgba(255,255,255,0.98)',
        borderRadius: '22px',
        padding: '44px 36px 36px 36px',
        boxShadow: '0 8px 32px rgba(80,80,180,0.13)',
        border: '1.5px solid #c7d2fe',
        backdropFilter: 'blur(3px)',
        transition: 'box-shadow 0.2s',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99,102,241,0.13)',
          color: '#fff',
          fontSize: '2rem',
          border: '3px solid #fff',
        }}>
          <FaLock />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '26px', marginBottom: '18px', marginTop: '18px', color: '#3730a3', textAlign: 'center', letterSpacing: '0.5px' }}>RESET PASSWORD</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, color: '#3730a3', fontSize: '15px', letterSpacing: '0.2px' }}>Password Baru</label>
            <div style={{ position: 'relative' }}>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '9px', border: '1.5px solid #c7d2fe', background: '#f1f5f9', color: '#1e293b', fontSize: '15px', marginTop: '6px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} />
              <FaLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: 18, opacity: 0.7 }} />
            </div>
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 700, color: '#3730a3', fontSize: '15px', letterSpacing: '0.2px' }}>Konfirmasi Password</label>
            <div style={{ position: 'relative' }}>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '9px', border: '1.5px solid #c7d2fe', background: '#f1f5f9', color: '#1e293b', fontSize: '15px', marginTop: '6px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} />
              <FaLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontSize: 18, opacity: 0.7 }} />
            </div>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', fontWeight: 600, textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FaExclamationCircle style={{ fontSize: 16 }} /> {error}</div>}
          {success && <div style={{ color: '#16a34a', fontSize: '15px', marginBottom: '12px', fontWeight: 700, textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FaCheckCircle style={{ fontSize: 20 }} /> Password berhasil direset! Anda akan diarahkan ke halaman login...</div>}
          <button
            type="button"
            onClick={() => setShowBackConfirm(true)}
            style={{ position: 'absolute', left: 18, top: 18, background: 'none', border: 'none', color: '#6366f1', fontSize: 22, cursor: 'pointer', zIndex: 2 }}
          >
            <FaArrowLeft />
          </button>
          {showBackConfirm && createPortal(
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 4px 24px rgba(80,80,180,0.13)', minWidth: 320, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Kembali ke halaman login?</div>
                <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, marginRight: 12, cursor: 'pointer' }}>Iya</button>
                <button onClick={() => setShowBackConfirm(false)} style={{ background: '#f1f5f9', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Tidak</button>
              </div>
            </div>,
            document.body
          )}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '9px', background: loading ? '#a5b4fc' : 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? '0 0 0 2px #a5b4fc' : '0 2px 8px 0 rgba(99,102,241,0.08)', marginTop: '2px', letterSpacing: '0.2px', transition: 'background 0.2s' }}>
            {loading ? 'Memproses...' : 'RESET PASSWORD'}
          </button>
          {showConfirm && createPortal(
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 4px 24px rgba(80,80,180,0.13)', minWidth: 320, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Reset password sekarang?</div>
                <button onClick={handleConfirm} style={{ background: 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, marginRight: 12, cursor: 'pointer' }}>Iya</button>
                <button onClick={() => setShowConfirm(false)} style={{ background: '#f1f5f9', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Tidak</button>
              </div>
            </div>,
            document.body
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
