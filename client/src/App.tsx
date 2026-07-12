import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Anleitung from "./pages/Anleitung";
import WebseiteTermin from "./pages/WebseiteTermin";
import KiReportTermin from "./pages/KiReportTermin";
import ExitPlanTermin from "./pages/ExitPlanTermin";
import DankeTermin from "./pages/DankeTermin";
import Admin from "./pages/Admin";
import ExitPlan from "./pages/ExitPlan";
import KiReport from "./pages/KiReport";
import Traumwebseite from "./pages/Traumwebseite";
import NotFound from "./pages/NotFound";
import Testoptimierer from "./pages/Testoptimierer";
import TestoptimiererProjekt from "./pages/TestoptimiererProjekt";
import TestoptimiererNeuerTest from "./pages/TestoptimiererNeuerTest";
import TestoptimiererNeuesProjekt from "./pages/TestoptimiererNeuesProjekt";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <ScrollToTop />
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
        <Route path="/testoptimierer/neu" component={TestoptimiererNeuesProjekt} />
        <Route path="/testoptimierer/projekt/:id" component={TestoptimiererProjekt} />
        <Route path="/testoptimierer/projekt/:id/neuer-test" component={TestoptimiererNeuerTest} />
        <Route component={NotFound} />
      </Switch>
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
