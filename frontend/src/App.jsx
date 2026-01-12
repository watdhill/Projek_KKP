import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuditLogSection from './pages/AuditLogSection'
import DashboardSection from './pages/DashboardSection'
import DataAplikasiSection from './pages/DataAplikasiSection'
import LaporanSection from './pages/LaporanSection'
import MasterDataSection from './pages/MasterDataSection'
import PenggunaSection from './pages/PenggunaSection'

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Master Data', path: '/master-data' },
  { label: 'Data Aplikasi', path: '/data-aplikasi' },
  { label: 'Laporan', path: '/laporan' },
  { label: 'Pengguna', path: '/pengguna' },
  { label: 'Audit Log', path: '/audit-log' },
]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout navItems={navItems} />}>
          <Route index element={<DashboardSection />} />
          <Route path="master-data" element={<MasterDataSection />} />
          <Route path="pengguna" element={<PenggunaSection />} />
          <Route path="data-aplikasi" element={<DataAplikasiSection />} />
          <Route path="laporan" element={<LaporanSection />} />
          <Route path="audit-log" element={<AuditLogSection />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
