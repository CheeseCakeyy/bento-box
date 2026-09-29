"use client";

import type { ReactNode, SyntheticEvent } from "react";

// Once someone interacts, opening animations stay finished even after focus leaves.
export default function PageEntrance({ children, className }: { children: ReactNode; className: string }) {
  const finish = (event: SyntheticEvent<HTMLDivElement>) => {
    event.currentTarget.dataset.entranceComplete = "true";
  };

  return <div className={className} onPointerDownCapture={finish} onFocusCapture={finish}>{children}</div>;
}
