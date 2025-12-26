import { notFound } from "next/navigation";
import { getCreator } from "@/lib/creators";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ creator: string }>;
}

export default async function CreatorLayout({ children, params }: LayoutProps) {
  const { creator: creatorSlug } = await params;
  const creator = getCreator(creatorSlug);

  if (!creator) {
    notFound();
  }

  return <>{children}</>;
}
