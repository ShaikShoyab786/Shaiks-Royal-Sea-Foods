import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Customer
import LandingPage from '@/pages/customer/LandingPage';
import LoginPage from '@/pages/customer/LoginPage';
import ProductsPage from '@/pages/customer/ProductsPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage';

// Admin
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminExecutivesPage from '@/pages/admin/AdminExecutivesPage';
import AdminTimeslotsPage from '@/pages/admin/AdminTimeslotsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

// Executive
import ExecutiveLoginPage from '@/pages/executive/ExecutiveLoginPage';
import ExecutiveDashboard from '@/pages/executive/ExecutiveDashboard';
import ExecutiveOrderDetailPage from '@/pages/executive/ExecutiveOrderDetailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/orders/:id" component={OrderTrackingPage} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/orders/:id" component={AdminOrderDetailPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/executives" component={AdminExecutivesPage} />
      <Route path="/admin/timeslots" component={AdminTimeslotsPage} />
      <Route path="/admin/reports" component={AdminReportsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />

      {/* Executive Routes */}
      <Route path="/executive/login" component={ExecutiveLoginPage} />
      <Route path="/executive" component={ExecutiveDashboard} />
      <Route path="/executive/orders/:id" component={ExecutiveOrderDetailPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
