import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '@/pages/layouts/RootLayout';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';

const HomePage = lazy(() => import('@/pages/Home'));
const StockMovementsPage = lazy(() => import('@/pages/StockMovements'));
const StockBalancePage = lazy(() => import('@/pages/StockBalance'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'movimentacoes',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StockMovementsPage />
          </Suspense>
        ),
      },
      {
        path: 'saldo',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StockBalancePage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
