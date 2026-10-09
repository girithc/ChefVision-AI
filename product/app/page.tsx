import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "ChefVizion AI · AI Agents for Smarter Restaurant Operations",
  description:
    "Autonomous AI agents for restaurant operations: kitchen dispatch, dynamic table pacing, smart inventory, and zero-waste prep.",
};

export default function Page() {
  return <LandingPage />;
}
