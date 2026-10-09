import type { Metadata } from "next";
import AppWorkspace from "@/components/AppWorkspace";
import BrowserShell from "@/components/BrowserShell";

export const metadata: Metadata = {
  title: "ChefVision AI · Back-of-House CRM",
};

export default function ProductPage() {
  return (
    <BrowserShell>
      <AppWorkspace />
    </BrowserShell>
  );
}
