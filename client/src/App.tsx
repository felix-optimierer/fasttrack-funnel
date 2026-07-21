import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Critical path: eagerly loaded (funnel pages users land on from ads)
import Home from "./pages/Home";
import ExitPlan from "./pages/ExitPlan";
import KiReport from "./pages/KiReport";
import Traumwebseite from "./pages/Traumwebseite";
import NotFound from "./pages/NotFound";

// Non-critical: lazy-loaded (admin, termin, testoptimierer)
const Anleitung = lazy(() => import("./pages/Anleitung"));
const WebseiteTermin = lazy(() => import("./pages/WebseiteTermin"));
const KiReportTermin = lazy(() => import("./pages/KiReportTermin"));
const ExitPlanTermin = lazy(() => import("./pages/ExitPlanTermin"));
const DankeTermin = lazy(() => import("./pages/DankeTermin"));
const Admin = lazy(() => import("./pages/Admin"));
const Testoptimierer = lazy(() => import("./pages/Testoptimierer"));
const TestoptimiererScorecard = lazy(() => import("./pages/TestoptimiererScorecard"));
const TestoptimiererEinstellungen = lazy(() => import("./pages/TestoptimiererEinstellungen"));
const TestoptimiererProjekt = lazy(() => import("./pages/TestoptimiererProjekt"));
const TestoptimiererNeuerTest = lazy(() => import("./pages/TestoptimiererNeuerTest"));
const TestoptimiererNeuesProjekt = lazy(() => import("./pages/TestoptimiererNeuesProjekt"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// Minimal loading fallback (same bg as app to avoid flash)
function LazyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LazyFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/anleitung" component={Anleitung} />
          <Route path="/webseite-termin" component={WebseiteTermin} />
          <Route path="/ki-report-termin" component={KiReportTermin} />
          <Route path="/exit-plan-termin" component={ExitPlanTermin} />
          <Route path="/danke-termin" component={DankeTermin} />
          <Route path="/admin" component={Admin} />
          <Route path="/exit-plan" component={ExitPlan} />
          <Route path="/ki-report" component={KiReport} />
          <Route path="/traumwebseite" component={Traumwebseite} />
          <Route path="/testoptimierer" component={Testoptimierer} />
          <Route path="/testoptimierer/scorecard" component={TestoptimiererScorecard} />
          <Route path="/testoptimierer/einstellungen" component={TestoptimiererEinstellungen} />
          <Route path="/testoptimierer/neu" component={TestoptimiererNeuesProjekt} />
          <Route path="/testoptimierer/projekt/:id" component={TestoptimiererProjekt} />
          <Route path="/testoptimierer/projekt/:id/neuer-test" component={TestoptimiererNeuerTest} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
