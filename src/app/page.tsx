import { auth } from "@clerk/nextjs/server";
import LandingPage from "@/components/landing/LandingPage";
import GalleryPage from "./GalleryPage";

export default async function Home() {
  const { userId } = await auth();

  // Unauthenticated users see the landing page
  if (!userId) {
    return <LandingPage />;
  }

  // Authenticated users see their photo gallery
  return <GalleryPage />;
}
