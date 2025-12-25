import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero, FeaturedContent, Pricing, ChatPreview } from "@/components/landing";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedContent />
        <ChatPreview />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
