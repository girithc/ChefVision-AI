import { useEffect } from "react";

import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/app-context";
import { matchRoute, navigate, useRoute } from "@/lib/router";
import { Admin } from "@/pages/Admin";
import { Dashboard } from "@/pages/Dashboard";
import { Events } from "@/pages/Events";
import { Inventory } from "@/pages/Inventory";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { ManualEntry } from "@/pages/ManualEntry";
import { MonthlyView } from "@/pages/MonthlyView";
import { ReceiptDetails } from "@/pages/ReceiptDetails";
import { Recipes } from "@/pages/Recipes";
import { Reorder } from "@/pages/Reorder";
import { ScanReceipt } from "@/pages/ScanReceipt";

function AppPage({ path }: { path: string }) {
  const { session } = useApp();
  const receipt = matchRoute("/receipts/:id", path);
  if (receipt) return <ReceiptDetails key={receipt.id} id={receipt.id} />;

  switch (path) {
    case "/dashboard":
      return <Dashboard />;
    case "/scan":
      return <ScanReceipt />;
    case "/manual":
      return <ManualEntry />;
    case "/events":
      return <Events />;
    case "/recipes":
      return <Recipes />;
    case "/monthly":
      return <MonthlyView />;
    case "/inventory":
      return <Inventory />;
    case "/reorder":
      return <Reorder />;
    case "/admin":
      return session?.role === "admin" ? <Admin /> : <Dashboard />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  const path = useRoute();
  const { session } = useApp();
  const isPublic = path === "/" || path === "/login";

  useEffect(() => {
    if (!session && !isPublic) navigate("/login");
    if (session && path === "/login") navigate("/dashboard");
  }, [session, isPublic, path]);

  if (path === "/") return <Landing />;
  if (!session) return <Login />;

  return (
    <Layout path={path}>
      <AppPage path={path} />
    </Layout>
  );
}
