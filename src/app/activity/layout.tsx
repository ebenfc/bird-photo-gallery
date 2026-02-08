import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity | Bird Feed",
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
