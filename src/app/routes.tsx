import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { EmissionsTracking } from "./components/EmissionsTracking";
import { SupplierManagement } from "./components/SupplierManagement";
import { AIInsights } from "./components/AIInsights";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { DataIngestion } from "./components/DataIngestion";
import { HackathonShowcase } from "./components/HackathonShowcase";
import { AiChatbot } from "./components/AiChatbot";
import { ScenarioWizard } from "./components/ScenarioWizard";
import { ESGAnalytics } from "./components/ESGAnalytics";

// Lazy-load MLAnalytics (includes TensorFlow.js ~1.6MB)
const MLAnalytics = lazy(() => import("./components/MLAnalytics").then(m => ({ default: m.MLAnalytics })));
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HackathonShowcase,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          { path: "dashboard", Component: Dashboard },
          { path: "data-ingestion", Component: DataIngestion },
          { path: "emissions", Component: EmissionsTracking },
          { path: "suppliers", Component: SupplierManagement },
          { path: "ai-insights", Component: AIInsights },
          { path: "ai-chat", Component: AiChatbot },
          { path: "scenario", Component: ScenarioWizard },
          { path: "ml-analytics", element: <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="size-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>}><MLAnalytics /></Suspense> },
          { path: "esg-analytics", Component: ESGAnalytics },
          { path: "reports", Component: Reports },
          { path: "settings", Component: Settings },
        ],
      }
    ],
  },
  {
    path: "/login",
    Component: Login,
  }
]);