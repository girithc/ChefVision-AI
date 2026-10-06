import { Loader2 } from "lucide-react";

import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/app-context";
import { matchRoute, useRoute } from "@/lib/router";
import { Admin } from "@/pages/Admin";
import { Dashboard } from "@/pages/Dashboard";
import { Events } from "@/pages/Events";
import { Inventory } from "@/pages/Inventory";
import { Landing } from "@/pages/Landing";
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

  if (path === "/welcome") return <Landing />;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" /> Connecting…
      </div>
    );
  }

  return (
    <Layout path={path}>
      <AppPage path={path} />
    </Layout>
  );
}
