import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FeedbackFab } from './components/FeedbackFab.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import { FeedbackProvider } from './context/FeedbackContext.jsx';
import { initObservability } from './observability/index.js';
import './site.css';

initObservability();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <App />
        <FeedbackFab />
        <FeedbackModal />
      </FeedbackProvider>
    </BrowserRouter>
  </StrictMode>,
);
