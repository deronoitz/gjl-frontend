import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardPage from './page';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
