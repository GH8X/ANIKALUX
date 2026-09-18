import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { RequireAuth } from "@/components/RequireAuth";
import { ProductGridSkeleton } from "@/components/States";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { Home } from "@/pages/Home";

/* Route-level code splitting keeps the first paint small. */
const Catalog = lazy(() => import("@/pages/Catalog").then((m) => ({ default: m.Catalog })));
const ProductDetail = lazy(() =>
  import("@/pages/ProductDetail").then((m) => ({ default: m.ProductDetail })),
);
const About = lazy(() => import("@/pages/About").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("@/pages/Contact").then((m) => ({ default: m.Contact })));
const WholesaleRequest = lazy(() =>
  import("@/pages/WholesaleRequest").then((m) => ({ default: m.WholesaleRequest })),
);
const Auth = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Auth })));
const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, search]);
  return null;
}

function RouteFallback() {
  return (
    <div className="container section">
      <div className="space-y-4">
        <div className="skeleton h-8 w-56 rounded-md" />
        <div className="skeleton h-4 w-96 max-w-full rounded-md" />
      </div>
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

function Shell() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[100svh] flex-col">
      <ScrollToTop />
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog preset="all" />} />
            <Route path="/pajamas" element={<Catalog preset="pajamas" />} />
            <Route path="/clothing" element={<Catalog preset="clothing" />} />
            <Route path="/new-arrivals" element={<Catalog preset="new" />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wholesale" element={<WholesaleRequest />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFab />
      <Toaster
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--card-foreground))",
          },
        }}
        aria-label={t.states.loading}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <StoreProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </StoreProvider>
    </I18nProvider>
  );
}
