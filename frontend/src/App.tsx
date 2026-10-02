import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import InformationDetail from './pages/InformationDetail';
import ReportInformation from './pages/ReportInformation';
import AdminDashboard from './pages/AdminDashboard';
import InformationForm from './pages/InformationForm';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/information/:id" element={<InformationDetail />} />
          <Route path="/report/:id" element={<ReportInformation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/new" element={<AdminRoute><InformationForm /></AdminRoute>} />
          <Route path="/admin/edit/:id" element={<AdminRoute><InformationForm /></AdminRoute>} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
