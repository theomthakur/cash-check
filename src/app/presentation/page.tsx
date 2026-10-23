import type { Metadata } from "next";
import Presentation from "@/components/presentation";

export const metadata: Metadata = {
  title: "Cash Check: a short presentation",
  description: "A short walkthrough of Cash Check: the problem, why SnapTrade, how it works, and what is next.",
};

export default function PresentationPage() {
  return <Presentation />;
}
