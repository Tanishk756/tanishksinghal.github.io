import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PageTransition } from './components/ui/PageTransition';
import { AuthProvider } from './cms/AuthContext';
import { PublicContentProvider } from './context/PublicContentContext';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Public Route Pages (Lazy-loaded for bundle splitting)
import { HomePage } from './pages/HomePage';
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage').then(m => ({ default: m.ExperiencePage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage })));
const PublicationsPage = lazy(() => import('./pages/PublicationsPage').then(m => ({ default: m.PublicationsPage })));
const PublicationDetailPage = lazy(() => import('./pages/PublicationDetailPage').then(m => ({ default: m.PublicationDetailPage })));
const PatentsPage = lazy(() => import('./pages/PatentsPage').then(m => ({ default: m.PatentsPage })));
const PatentDetailPage = lazy(() => import('./pages/PatentDetailPage').then(m => ({ default: m.PatentDetailPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage').then(m => ({ default: m.CertificationsPage })));
const SkillsPage = lazy(() => import('./pages/SkillsPage').then(m => ({ default: m.SkillsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const ResumePage = lazy(() => import('./pages/ResumePage').then(m => ({ default: m.ResumePage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Admin CMS Route Pages (Lazy-loaded, isolated from public bundle)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage').then(m => ({ default: m.AdminProfilePage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage').then(m => ({ default: m.AdminProjectsPage })));
const AdminProjectEditorPage = lazy(() => import('./pages/admin/AdminProjectEditorPage').then(m => ({ default: m.AdminProjectEditorPage })));
const AdminResearchPage = lazy(() => import('./pages/admin/AdminResearchPage').then(m => ({ default: m.AdminResearchPage })));
const AdminPublicationsPage = lazy(() => import('./pages/admin/AdminPublicationsPage').then(m => ({ default: m.AdminPublicationsPage })));
const AdminPatentsPage = lazy(() => import('./pages/admin/AdminPatentsPage').then(m => ({ default: m.AdminPatentsPage })));
const AdminExperiencePage = lazy(() => import('./pages/admin/AdminExperiencePage').then(m => ({ default: m.AdminExperiencePage })));
const AdminSkillsPage = lazy(() => import('./pages/admin/AdminSkillsPage').then(m => ({ default: m.AdminSkillsPage })));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })));
const AdminBlogEditorPage = lazy(() => import('./pages/admin/AdminBlogEditorPage').then(m => ({ default: m.AdminBlogEditorPage })));
const AdminAchievementsPage = lazy(() => import('./pages/admin/AdminAchievementsPage').then(m => ({ default: m.AdminAchievementsPage })));
const AdminCertificationsPage = lazy(() => import('./pages/admin/AdminCertificationsPage').then(m => ({ default: m.AdminCertificationsPage })));
const AdminOrganizationsPage = lazy(() => import('./pages/admin/AdminOrganizationsPage').then(m => ({ default: m.AdminOrganizationsPage })));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage').then(m => ({ default: m.AdminMediaPage })));
const AdminContactPage = lazy(() => import('./pages/admin/AdminContactPage').then(m => ({ default: m.AdminContactPage })));
const AdminHistoryPage = lazy(() => import('./pages/admin/AdminHistoryPage').then(m => ({ default: m.AdminHistoryPage })));

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col selection:bg-[#141517] selection:text-[#fbfaf7] ${
      isAdmin ? 'bg-slate-100 text-slate-900 font-sans' : 'bg-[#fbfaf7] text-[#141517] font-sans'
    }`}>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink-900 focus:text-paper-100 focus:rounded-full focus:shadow-lg focus:outline-none text-xs font-sans font-semibold"
      >
        Skip to main content
      </a>

      {/* Public Navigation Header (Omitted for /admin) */}
      {!isAdmin && <Navbar />}

      {/* Dynamic Route Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 relative z-10 focus:outline-none">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Suspense fallback={null}>
              <Routes location={location}>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/publications/:slug" element={<PublicationDetailPage />} />
                <Route path="/patents" element={<PatentsPage />} />
                <Route path="/patents/:slug" element={<PatentDetailPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/certifications" element={<CertificationsPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Admin CMS Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/contact" element={<AdminContactPage />} />
                <Route path="/admin/profile" element={<AdminProfilePage />} />
                <Route path="/admin/projects" element={<AdminProjectsPage />} />
                <Route path="/admin/projects/new" element={<AdminProjectEditorPage />} />
                <Route path="/admin/projects/:id/edit" element={<AdminProjectEditorPage />} />
                <Route path="/admin/research" element={<AdminResearchPage />} />
                <Route path="/admin/publications" element={<AdminPublicationsPage />} />
                <Route path="/admin/patents" element={<AdminPatentsPage />} />
                <Route path="/admin/experience" element={<AdminExperiencePage />} />
                <Route path="/admin/achievements" element={<AdminAchievementsPage />} />
                <Route path="/admin/certifications" element={<AdminCertificationsPage />} />
                <Route path="/admin/skills" element={<AdminSkillsPage />} />
                <Route path="/admin/blog" element={<AdminBlogPage />} />
                <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
                <Route path="/admin/blog/:id/edit" element={<AdminBlogEditorPage />} />
                <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
                <Route path="/admin/media" element={<AdminMediaPage />} />
                <Route path="/admin/history" element={<AdminHistoryPage />} />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </PageTransition>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Public Footer (Omitted for /admin) */}
      {!isAdmin && <Footer />}
    </div>
  );
};

export function App() {
  const basePath = (import.meta as any).env?.BASE_URL || '/';
  return (
    <AuthProvider>
      <PublicContentProvider>
        <Router basename={basePath}>
          <ScrollToTop />
          <AppContent />
        </Router>
      </PublicContentProvider>
    </AuthProvider>
  );
}

export default App;
