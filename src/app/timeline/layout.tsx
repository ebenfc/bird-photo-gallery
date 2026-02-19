import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline | Bird Feed",
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
