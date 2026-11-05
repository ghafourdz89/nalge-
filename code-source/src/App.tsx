import { AppProvider, useApp } from './context/AppContext';
import { CookieBanner, Footer, Header, MiniCart, Toast } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductPage } from './pages/Product';
import { CartPage, CheckoutPage, ConfirmationPage } from './pages/Shop';
import { AboutPage, AccountPage, ArticlePage, BlogPage, ContactPage, FaqPage, LegalPage, NotFound, RoutinesPage, SearchPage, ShippingPage } from './pages/Content';
import { categoryOrder, collections } from './data/products';
import { AdminPage } from './pages/Admin';
import { isPreview, setPreview } from './services/store';

function Router() {
  const { route } = useApp();
  const r = route;
  if (r === 'accueil') return <Home />;
  if (r === 'catalogue') return <Catalog key={r} mode="all" />;
  if (r === 'categorie-visage') return <Catalog key={r} mode="face" />;
  if (r.startsWith('categorie-')) {
    const id = r.slice('categorie-'.length);
    return categoryOrder.some((c) => c === id) ? <Catalog key={r} mode="category" id={id} /> : <NotFound />;
  }
  if (r.startsWith('collection-')) {
    const id = r.slice('collection-'.length);
    return collections.some((c) => c.id === id) ? <Catalog key={r} mode="collection" id={id} /> : <NotFound />;
  }
  if (r.startsWith('produit-')) return <ProductPage key={r} slug={r.slice('produit-'.length)} />;
  if (r.startsWith('article-')) return <ArticlePage key={r} slug={r.slice('article-'.length)} />;
  switch (r) {
    case 'recherche': return <SearchPage />;
    case 'routines': return <RoutinesPage />;
    case 'a-propos': return <AboutPage />;
    case 'blog': return <BlogPage />;
    case 'contact': return <ContactPage />;
    case 'faq': return <FaqPage />;
    case 'livraison-retours': return <ShippingPage />;
    case 'confidentialite': return <LegalPage kind="privacy" />;
    case 'cgv': return <LegalPage kind="cgv" />;
    case 'mentions-legales': return <LegalPage kind="legal" />;
    case 'panier': return <CartPage />;
    case 'commande': return <CheckoutPage />;
    case 'confirmation': return <ConfirmationPage />;
    case 'compte': return <AccountPage />;
    default: return <NotFound />;
  }
}

function Shell() {
  const { route } = useApp();
  if (route === 'admin') return <AdminPage />;
  return (
    <div className="app">
      {isPreview() && (
        <div className="preview-bar" role="note">
          Aperçu de vos modifications (non publiées).
          <a href="#admin" onClick={() => window.setTimeout(() => window.location.reload(), 0)}>Retour à l'administration</a>
          <button type="button" onClick={() => { setPreview(false); window.location.hash = 'accueil'; window.location.reload(); }}>Quitter l'aperçu</button>
        </div>
      )}
        <Header />
        <Router />
        <Footer />
        <MiniCart />
        <CookieBanner />
        <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
