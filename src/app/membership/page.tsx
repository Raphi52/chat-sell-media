import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing";

export default function MembershipPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
