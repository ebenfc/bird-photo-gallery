import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haikubox | Bird Feed",
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
