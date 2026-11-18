import { ChevronRight, User, Bell, HelpCircle, Shield, LogOut, Download, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportData, importData, loadDemoData, clearAllData } from '../storage';
import { useState } from 'react';

const currencies = [
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export default function Profile() {
  const { data, updateProfile, refreshData } = useApp();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velora-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar los datos');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await importData(text);
          await refreshData();
          alert('Datos importados correctamente');
        } catch (error) {
          alert('Error al importar los datos. Verifica el archivo JSON.');
        }
      }
    };
    input.click();
  };

  const handleLoadDemo = async () => {
    if (confirm('¿Cargar datos de demostración? Esto reemplazará tus datos actuales.')) {
      await loadDemoData();
      await refreshData();
      alert('Datos de demostración cargados');
    }
  };

  const handleClearData = async () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      await clearAllData();
      await refreshData();
      alert('Todos los datos han sido borrados');
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    await updateProfile({ currency: currencyCode });
    setShowCurrencyModal(false);
  };

  const currentCurrency = currencies.find(c => c.code === data.profile.currency) || currencies[0];

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
              {data.profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{data.profile.name}</h2>
              <p className="text-sm opacity-90">{data.profile.email || 'usuario@velora.app'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Configuración
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <User size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Información Personal</p>
                <p className="text-sm text-gray-500">Editar nombre y email</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => setShowCurrencyModal(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">{currentCurrency.symbol}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Moneda</p>
                <p className="text-sm text-gray-500">{currentCurrency.name}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Notificaciones</p>
                <p className="text-sm text-gray-500">Gestionar alertas</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Datos
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={handleExport}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Download size={20} className="text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Exportar Datos</p>
                <p className="text-sm text-gray-500">Descargar backup JSON</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={handleImport}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Importar Datos</p>
                <p className="text-sm text-gray-500">Restaurar desde backup</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={handleLoadDemo}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Cargar Datos Demo</p>
                <p className="text-sm text-gray-500">Para pruebas</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
            Soporte
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} className="text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Ayuda & Soporte</p>
                <p className="text-sm text-gray-500">Centro de ayuda</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Seguridad & Privacidad</p>
                <p className="text-sm text-gray-500">Gestionar permisos</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <button 
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors mb-4"
        >
          <LogOut size={20} />
          <span>Borrar Todos los Datos</span>
        </button>

        <div className="text-center text-sm text-gray-400 mt-6">
          <p>Velora Finanzas v{data.version}</p>
          <p className="mt-1">Tus datos solo se guardan localmente</p>
        </div>
      </div>

      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowCurrencyModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Seleccionar Moneda</h3>
            <div className="space-y-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                    data.profile.currency === currency.code
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {currency.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{currency.name}</p>
                    <p className="text-sm text-gray-500">{currency.code}</p>
                  </div>
                  {data.profile.currency === currency.code && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
