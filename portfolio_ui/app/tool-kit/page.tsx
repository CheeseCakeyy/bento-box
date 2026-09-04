import type { Metadata } from "next";
import ToolkitExperience from "./ToolkitExperience";

export const metadata: Metadata = {
  title: "Tool Kit — Adwait Tagalpallewar",
  description: "The languages, machine-learning tools, LLM systems, and data libraries in Adwait Tagalpallewar's working set.",
};

export default function ToolKitPage() {
  return <ToolkitExperience />;
}
