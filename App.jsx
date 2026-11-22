import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import TasksPage from './pages/TasksPage.jsx';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <p className="boot">Loading...</p>;
  return user ? <TasksPage /> : <AuthPage />;
}
