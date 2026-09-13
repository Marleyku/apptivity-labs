import { Navigate } from 'react-router-dom';

/** Old Access-gated path → public status panel */
export default function AdminControlRedirect() {
  return <Navigate to="/status" replace />;
}
