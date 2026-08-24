import type { Metadata } from "next";
import CharacterTransitionDemo from "./CharacterTransitionDemo";

export const metadata: Metadata = {
  title: "Character Transition Demo — Adwait Tagalpallewar",
  description: "An isolated prototype for a character-led page transition.",
};

export default function CharacterTransitionDemoPage() {
  return <CharacterTransitionDemo />;
}
