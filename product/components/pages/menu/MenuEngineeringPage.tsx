"use client";

import { PageHeader } from "../../shared/ui";
import MenuMatrix from "./matrix/MenuMatrix";

export default function MenuEngineeringPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Menu Engineering" />
      <MenuMatrix />
    </div>
  );
}
