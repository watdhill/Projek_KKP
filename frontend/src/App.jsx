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
import OperatorUPTPage from './pages/operatorUPT/OperatorUPTPage'
import OperatorEselon1Dashboard from './pages/operatorEselon1/OperatorEselon1Dashboard'
import OperatorEselon1MasterData from './pages/operatorEselon1/OperatorEselon1MasterData'
import OperatorEselon1DataAplikasi from './pages/operatorEselon1/OperatorEselon1DataAplikasi'
import OperatorEselon1Profile from './pages/operatorEselon1/OperatorEselon1Profile'
import OperatorEselon2Dashboard from './pages/operatorEselon2/OperatorEselon2Dashboard'
import OperatorEselon2MasterData from './pages/operatorEselon2/OperatorEselon2MasterData'
import OperatorEselon2DataAplikasi from './pages/operatorEselon2/OperatorEselon2DataAplikasi'
import OperatorEselon2Profile from './pages/operatorEselon2/OperatorEselon2Profile'
import OperatorUPTDashboard from './pages/operatorUPT/OperatorUPTDashboard'
import OperatorUPTMasterData from './pages/operatorUPT/OperatorUPTMasterData'
import OperatorUPTDataAplikasi from './pages/operatorUPT/OperatorUPTDataAplikasi'
import OperatorUPTProfile from './pages/operatorUPT/OperatorUPTProfile'
import AdminProfile from './pages/AdminProfile'
import LoginPage from './pages/LoginPage'

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { label: 'Master Data', path: '/admin/master-data', icon: 'master' },
  { label: 'Pengguna', path: '/admin/pengguna', icon: 'pengguna' },
  { label: 'Data Aplikasi', path: '/admin/data-aplikasi', icon: 'aplikasi' },
  { label: 'Laporan', path: '/admin/laporan', icon: 'laporan' },
  { label: 'Audit Log', path: '/admin/audit-log', icon: 'audit' },
]

const operatorEselon1Nav = [
  { label: 'Dashboard', path: '/operator-eselon1', icon: 'dashboard' },
  { label: 'Master Data', path: '/operator-eselon1/master-data', icon: 'master' },
  { label: 'Data Aplikasi', path: '/operator-eselon1/data-aplikasi', icon: 'aplikasi' },
]

const operatorEselon2Nav = [
  { label: 'Dashboard', path: '/operator-eselon2', icon: 'dashboard' },
  { label: 'Master Data', path: '/operator-eselon2/master-data', icon: 'master' },
  { label: 'Data Aplikasi', path: '/operator-eselon2/data-aplikasi', icon: 'aplikasi' },
]

const operatorUPTNav = [
  { label: 'Dashboard', path: '/operator-upt', icon: 'dashboard' },
  { label: 'Master Data', path: '/operator-upt/master-data', icon: 'master' },
  { label: 'Data Aplikasi', path: '/operator-upt/data-aplikasi', icon: 'aplikasi' },
]

const roleHome = {
  admin: '/admin',
  operatorEselon1: '/operator-eselon1',
  operatorEselon2: '/operator-eselon2',
  operatorUPT: '/operator-upt'
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
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Operator Eselon 1 area */}
        <Route path="/operator-eselon1" element={<RequireAuth allowedRoles={['operatorEselon1']}><Layout navItems={operatorEselon1Nav} /></RequireAuth>}>
          <Route element={<OperatorEselon1Page />}>
            <Route index element={<OperatorEselon1Dashboard />} />
            <Route path="master-data" element={<OperatorEselon1MasterData />} />
            <Route path="data-aplikasi" element={<OperatorEselon1DataAplikasi />} />
            <Route path="profile" element={<OperatorEselon1Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/operator-eselon1" replace />} />
        </Route>

        {/* Operator Eselon 2 area */}
        <Route path="/operator-eselon2" element={<RequireAuth allowedRoles={['operatorEselon2']}><Layout navItems={operatorEselon2Nav} /></RequireAuth>}>
          <Route element={<OperatorEselon2Page />}>
            <Route index element={<OperatorEselon2Dashboard />} />
            <Route path="master-data" element={<OperatorEselon2MasterData />} />
            <Route path="data-aplikasi" element={<OperatorEselon2DataAplikasi />} />
            <Route path="profile" element={<OperatorEselon2Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/operator-eselon2" replace />} />
        </Route>

        {/* Operator UPT area */}
        <Route path="/operator-upt" element={<RequireAuth allowedRoles={['operatorUPT']}><Layout navItems={operatorUPTNav} /></RequireAuth>}>
          <Route element={<OperatorUPTPage />}>
            <Route index element={<OperatorUPTDashboard />} />
            <Route path="master-data" element={<OperatorUPTMasterData />} />
            <Route path="data-aplikasi" element={<OperatorUPTDataAplikasi />} />
            <Route path="profile" element={<OperatorUPTProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/operator-upt" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
