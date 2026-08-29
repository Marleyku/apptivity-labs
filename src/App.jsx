import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SmsOptIn from './pages/SmsOptIn.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sms-opt-in" element={<SmsOptIn />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
