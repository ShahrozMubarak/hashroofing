import { useCallback, useEffect, useState } from 'react';
import MobileDrawer from './components/layout/MobileDrawer';
import SiteFooter from './components/layout/SiteFooter';
import SiteHeader from './components/layout/SiteHeader';
import { ToastProvider, useToast } from './components/toast/ToastViewport';
import { SITE_CONFIG } from './config/siteConfig';
import { PageFade, useSmoothScroll } from './design/motion';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import EstimatePage from './pages/EstimatePage';
import HomePage from './pages/HomePage';
import InspectionsPage from './pages/InspectionsPage';
import PortalPage from './pages/PortalPage';
import ProjectsPage from './pages/ProjectsPage';

function viewFromPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/about') return 'about';
  if (clean === '/contact') return 'contact';
  if (clean === '/estimate') return 'estimate';
  if (clean === '/inspections') return 'inspections';
  if (clean === '/portal') return 'portal';
  if (clean === '/projects') return 'projects';
  if (clean === '/admin') return 'admin';
  return 'home';
}

function pathFromView(view) {
  if (view === 'about') return '/about';
  if (view === 'contact') return '/contact';
  if (view === 'estimate') return '/estimate';
  if (view === 'inspections') return '/inspections';
  if (view === 'portal') return '/portal';
  if (view === 'projects') return '/projects';
  if (view === 'admin') return '/admin';
  return '/';
}

const VIEW_LABELS = {
  home: 'Auren Home',
  about: 'About & Territory',
  contact: 'Contact & Consultation',
  estimate: 'Engineering Scope Estimator',
  inspections: 'Inspections & Storm Triage',
  portal: 'Client Portal & Warranties',
  projects: 'Architectural Case Studies',
  admin: 'Operations Command',
};

const VIEW_SEO = {
  home: {
    title: 'Auren Roofing Co. — Architectural Residential Roofing & Engineering',
    description:
      'Precision standing seam steel, composite slate, engineered estimates, and certified inspections across Seattle, Bellevue, Tacoma, Spokane & Portland.',
    robots: 'index, follow',
  },
  about: {
    title: 'About & Territory Hubs — Auren Roofing Co.',
    description:
      'Explore Auren Roofing Co. Pacific Northwest territory hubs, regional wind-uplift standards, and licensed architectural crews.',
    robots: 'index, follow',
  },
  contact: {
    title: 'Contact & Project Briefing — Auren Roofing Co.',
    description:
      'Request a detailed residential roof consultation routed directly to your Pacific Northwest territory estimator.',
    robots: 'index, follow',
  },
  estimate: {
    title: 'Architectural Scope & Roof Cost Estimator — Auren Roofing Co.',
    description:
      'Configure roof square footage, pitch, standing seam steel or composite slate systems, and download an instant PDF engineering proposal.',
    robots: 'index, follow',
  },
  inspections: {
    title: 'Thermal Inspections & Emergency Storm Triage — Auren Roofing Co.',
    description:
      'Reserve certified drone and thermal roof inspection slots or file emergency storm tarp dispatch requests across WA and OR.',
    robots: 'index, follow',
  },
  portal: {
    title: 'Homeowner Client Portal & Warranties — Auren Roofing Co.',
    description:
      'Track 8-stage project milestones, inspect daily crew weather logs, approve change orders, and verify transferable warranty certificates.',
    robots: 'index, follow',
  },
  projects: {
    title: 'Before & After Architectural Case Studies — Auren Roofing Co.',
    description:
      'Compare weathered tear-offs to finished standing seam and composite slate installations across Seattle, Bellevue, Tacoma & Portland.',
    robots: 'index, follow',
  },
  admin: {
    title: 'Operations Command — Auren Roofing Co.',
    description: 'Internal Auren Roofing Co. estimating, dispatch, storm claim, and warranty console.',
    robots: 'noindex, nofollow',
  },
};

function AppShell() {
  useSmoothScroll();
  const { notify } = useToast();
  const [currentView, setCurrentView] = useState(() => viewFromPath(window.location.pathname));
  const [selectedService, setSelectedService] = useState('Roof replacement');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentView(viewFromPath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const seo = VIEW_SEO[currentView] || VIEW_SEO.home;
    document.title = seo.title || `${VIEW_LABELS[currentView] || SITE_CONFIG.brandName}`;

    const setMeta = (selector, attrName, attrValue, content) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[name="robots"]', 'name', 'robots', seo.robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);

    const canonicalHref = `${window.location.origin}${pathFromView(currentView)}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalHref);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);
  }, [currentView]);

  const navigateTo = useCallback(
    (view) => {
      const nextPath = pathFromView(view);
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ view }, '', nextPath);
      }
      setCurrentView(view);
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (VIEW_LABELS[view]) notify(VIEW_LABELS[view], 'page');
    },
    [notify],
  );

  const handleSelectService = useCallback(
    (serviceTitle) => {
      setSelectedService(serviceTitle);
      navigateTo('contact');
    },
    [navigateTo],
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <SiteHeader currentView={currentView} onNavigate={navigateTo} onOpenMenu={() => setMobileOpen(true)} />
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onNavigate={navigateTo} />
      <main style={{ flex: 1 }}>
        <PageFade viewKey={currentView}>
          {currentView === 'home' && <HomePage onNavigate={navigateTo} onSelectService={handleSelectService} />}
          {currentView === 'about' && <AboutPage onNavigate={navigateTo} />}
          {currentView === 'contact' && <ContactPage initialService={selectedService} onNavigate={navigateTo} />}
          {currentView === 'estimate' && <EstimatePage onNavigate={navigateTo} />}
          {currentView === 'inspections' && <InspectionsPage onNavigate={navigateTo} />}
          {currentView === 'portal' && <PortalPage />}
          {currentView === 'projects' && <ProjectsPage onNavigate={navigateTo} />}
          {currentView === 'admin' && <AdminPage />}
        </PageFade>
      </main>
      <SiteFooter onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
