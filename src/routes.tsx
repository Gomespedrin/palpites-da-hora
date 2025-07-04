import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load das páginas
const AuthPage = lazy(() => import('./pages/Auth'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const MeuTimePage = lazy(() => import('./pages/MeuTime'));
const TransferenciasPage = lazy(() => import('./pages/Transferencias'));
const RankingPage = lazy(() => import('./pages/Ranking'));
const AdminPage = lazy(() => import('./pages/Admin'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/meu-time',
    element: <MeuTimePage />,
  },
  {
    path: '/transferencias',
    element: <TransferenciasPage />,
  },
  {
    path: '/ranking',
    element: <RankingPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
];