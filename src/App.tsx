import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Cards from './pages/Cards';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import SendMoney from './pages/SendMoney';
import ReceiveMoney from './pages/ReceiveMoney';
import TopUp from './pages/TopUp';
import TransactionDetail from './pages/TransactionDetail';
import Onboarding from './pages/Onboarding';

function ThemeSync() {
  const { data } = useApp();
  useEffect(() => {
    const dark = data.profile.theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.lang = data.profile.language === 'pt' ? 'pt-BR' : 'es';
  }, [data.profile.theme, data.profile.language]);
  return null;
}

function AppRoutes() {
  const { data, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="h-10 w-10 animate-pulse rounded-full bg-blue-500/30" />
      </div>
    );
  }

  if (!data.profile.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/send" element={<SendMoney />} />
        <Route path="/receive" element={<ReceiveMoney />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/velora-finanzas">
        <ThemeSync />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
