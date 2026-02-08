import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Species | Bird Feed",
};

export default function SpeciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
