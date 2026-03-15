import { useAppStore } from './store/useAppStore';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { TeamManagement } from './pages/TeamManagement';
import { MatchPage } from './pages/MatchPage';
import { StatsPage } from './pages/StatsPage';

function App() {
  const { activePage } = useAppStore();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'team': return <TeamManagement />;
      case 'match': return <MatchPage />;
      case 'stats': return <StatsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
}

export default App;
