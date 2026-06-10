"use client";

import { useState, useRef, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import Workspace from "@/components/Workspace";

export type View = "landing" | "workspace";

export default function Home() {
  const [view, setView] = useState<View>("landing");

  return view === "landing" ? (
    <LandingPage onLaunch={() => setView("workspace")} />
  ) : (
    <Workspace onHome={() => setView("landing")} />
  );
}
