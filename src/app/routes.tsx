import { createBrowserRouter } from "react-router";
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