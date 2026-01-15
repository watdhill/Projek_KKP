import { useState, useEffect } from 'react'

function AdminProfile() {
    const [userData, setUserData] = useState({
        nama: '',
        nip: '',
        email: '',
        jabatan: '',
        nama_role: ''
    });

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:5000/api/users/${userId}`);
            const result = await response.json();

            if (result.success) {
                setUserData(result.data);
                setFormData(result.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage({ type: 'error', text: 'Gagal memuat data profile' });
        }
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        setFormData(userData);
        setMessage({ type: '', text: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: formData.nama,
                    nip: formData.nip,
                    email: formData.email,
                    jabatan: formData.jabatan
                })
            });

            const result = await response.json();

            if (result.success) {
                setUserData(result.data);
                setEditMode(false);
                setMessage({ type: 'success', text: 'Profile berhasil diupdate' });

                // Update localStorage jika ada
                localStorage.setItem('userName', result.data.nama);

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal mengupdate profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengupdate profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validasi
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak sama' });
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
            setLoading(false);
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:5000/api/users/${userId}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(false);
                setMessage({ type: 'success', text: 'Password berhasil diubah' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal mengubah password' });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengubah password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                    Profile Saya
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                    Kelola informasi profile dan password Anda
                </p>
            </div>

            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                        Informasi Profile
                    </h3>
                    {!editMode && (
                        <button
                            onClick={handleEditToggle}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {!editMode ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                                Nama Lengkap
                            </label>
                            <p style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                                {userData.nama || '-'}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                                NIP
                            </label>
                            <p style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                                {userData.nip || 'Belum diisi'}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                                Email
                            </label>
                            <p style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                                {userData.email || '-'}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                                Jabatan
                            </label>
                            <p style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                                {userData.jabatan || 'Belum diisi'}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>
                                Role
                            </label>
                            <p style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                                {userData.nama_role || '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    name="nama"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    NIP <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={formData.nip || ''}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Jabatan <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="jabatan"
                                    value={formData.jabatan || ''}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: loading ? '#94a3b8' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEditToggle}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'white',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Password Section */}
            <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                        Keamanan Password
                    </h3>
                    {!showPasswordForm && (
                        <button
                            onClick={() => {
                                setShowPasswordForm(true);
                                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                setMessage({ type: '', text: '' });
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Ganti Password
                        </button>
                    )}
                </div>

                {!showPasswordForm ? (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Klik tombol "Ganti Password" untuk mengubah password Anda
                    </p>
                ) : (
                    <form onSubmit={handleChangePassword}>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Password Lama *
                                </label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Password Baru *
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                                <small style={{ color: '#64748b', fontSize: '12px' }}>
                                    Minimal 6 karakter
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0f172a', marginBottom: '6px' }}>
                                    Konfirmasi Password Baru *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: loading ? '#94a3b8' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    {loading ? 'Mengubah...' : 'Ubah Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        setMessage({ type: '', text: '' });
                                    }}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'white',
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AdminProfile
