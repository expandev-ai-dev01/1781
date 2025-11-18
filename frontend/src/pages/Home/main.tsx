import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">StockBox</h1>
        <p className="text-lg text-gray-600 mb-8">Sistema de Controle de Estoque</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/movimentacoes')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Movimentações
          </button>
          <button
            onClick={() => navigate('/saldo')}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Consultar Saldo
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
