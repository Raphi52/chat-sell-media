import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Hero,
  ContentShowcase,
  SocialProof,
  ExclusivePreview,
  ChatPreview,
  Testimonials,
  Pricing
} from "@/components/landing";
import { getCreator, getAllCreatorSlugs } from "@/lib/creators";

interface PageProps {
  params: Promise<{ creator: string }>;
}

export async function generateStaticParams() {
  return getAllCreatorSlugs().map((creator) => ({ creator }));
}

export default async function CreatorHome({ params }: PageProps) {
  const { creator: creatorSlug } = await params;
  const creator = getCreator(creatorSlug);

  if (!creator) {
    notFound();
  }

  return (
    <>
      <Navbar creatorSlug={creatorSlug} />
      <main className="bg-black">
        {/* Hero - Full screen with parallax */}
        <Hero creator={creator} />

        {/* Content Showcase - Parallax gallery with blurred previews */}
        <ContentShowcase creatorSlug={creatorSlug} />

        {/* Social Proof - Notifications, stats, trust badges */}
        <SocialProof />

        {/* Exclusive Preview - Large teaser cards */}
        <ExclusivePreview creatorSlug={creatorSlug} />

        {/* Chat Preview - Messaging feature showcase */}
        <ChatPreview creator={creator} />

        {/* Testimonials - Member reviews */}
        <Testimonials />

        {/* Pricing - Subscription plans */}
        <Pricing creatorSlug={creatorSlug} />
      </main>
      <Footer creatorSlug={creatorSlug} />
    </>
  );
}
