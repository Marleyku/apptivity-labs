import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Privacy from './pages/Privacy.jsx';
import SmsOptIn from './pages/SmsOptIn.jsx';
import Terms from './pages/Terms.jsx';
import AdminIndex from './pages/admin/AdminIndex.jsx';
import AdminApp from './pages/admin/AdminApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/sms-opt-in" element={<SmsOptIn />} />
      <Route path="/admin" element={<AdminIndex />} />
      <Route path="/admin/:appSlug" element={<AdminApp />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
