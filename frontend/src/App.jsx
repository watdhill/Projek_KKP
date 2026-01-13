import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuditLogSection from './pages/AuditLogSection'
import DashboardSection from './pages/DashboardSection'
import DataAplikasiSection from './pages/DataAplikasiSection'
import LaporanSection from './pages/LaporanSection'
import MasterDataSection from './pages/MasterDataSection'
import PenggunaSection from './pages/PenggunaSection'
import OperatorEselon1Page from './pages/operatorEselon1/OperatorEselon1Page'
import OperatorEselon2Page from './pages/operatorEselon2/OperatorEselon2Page'
import OperatorEselon1Dashboard from './pages/operatorEselon1/OperatorEselon1Dashboard'
import OperatorEselon1MasterData from './pages/operatorEselon1/OperatorEselon1MasterData'
import OperatorEselon1DataAplikasi from './pages/operatorEselon1/OperatorEselon1DataAplikasi'
import OperatorEselon2Dashboard from './pages/operatorEselon2/OperatorEselon2Dashboard'
import OperatorEselon2MasterData from './pages/operatorEselon2/OperatorEselon2MasterData'
import OperatorEselon2DataAplikasi from './pages/operatorEselon2/OperatorEselon2DataAplikasi'
import LoginPage from './pages/LoginPage'

const adminNav = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Master Data', path: '/admin/master-data' },
  { label: 'Data Aplikasi', path: '/admin/data-aplikasi' },
  { label: 'Laporan', path: '/admin/laporan' },
  { label: 'Pengguna', path: '/admin/pengguna' },
  { label: 'Audit Log', path: '/admin/audit-log' },
]

const operatorEselon1Nav = [
  { label: 'Dashboard', path: '/operator-eselon1' },
  { label: 'Master Data', path: '/operator-eselon1/master-data' },
  { label: 'Data Aplikasi', path: '/operator-eselon1/data-aplikasi' },
]

const operatorEselon2Nav = [
  { label: 'Dashboard', path: '/operator-eselon2' },
  { label: 'Master Data', path: '/operator-eselon2/master-data' },
  { label: 'Data Aplikasi', path: '/operator-eselon2/data-aplikasi' },
]

const roleHome = {
  admin: '/admin',
  operatorEselon1: '/operator-eselon1',
  operatorEselon2: '/operator-eselon2'
}

function RequireAuth({ allowedRoles, children }) {
  const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHome[role] || '/login'} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin area */}
        <Route path="/admin" element={<RequireAuth allowedRoles={['admin']}><Layout navItems={adminNav} /></RequireAuth>}>
          <Route index element={<DashboardSection />} />
          <Route path="master-data" element={<MasterDataSection />} />
          <Route path="pengguna" element={<PenggunaSection />} />
          <Route path="data-aplikasi" element={<DataAplikasiSection />} />
          <Route path="laporan" element={<LaporanSection />} />
          <Route path="audit-log" element={<AuditLogSection />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Operator Eselon 1 area */}
        <Route path="/operator-eselon1" element={<RequireAuth allowedRoles={['operatorEselon1']}><Layout navItems={operatorEselon1Nav} /></RequireAuth>}>
          <Route index element={<OperatorEselon1Dashboard />} />
          <Route path="master-data" element={<OperatorEselon1MasterData />} />
          <Route path="data-aplikasi" element={<OperatorEselon1DataAplikasi />} />
          <Route path="*" element={<Navigate to="/operator-eselon1" replace />} />
        </Route>

        {/* Operator Eselon 2 area */}
        <Route path="/operator-eselon2" element={<RequireAuth allowedRoles={['operatorEselon2']}><Layout navItems={operatorEselon2Nav} /></RequireAuth>}>
          <Route index element={<OperatorEselon2Dashboard />} />
          <Route path="master-data" element={<OperatorEselon2MasterData />} />
          <Route path="data-aplikasi" element={<OperatorEselon2DataAplikasi />} />
          <Route path="*" element={<Navigate to="/operator-eselon2" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
