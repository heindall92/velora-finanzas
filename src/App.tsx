import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/velora-finanzas">
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
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
