import { redirect } from "next/navigation";
import { getDefaultCreator } from "@/lib/creators";

export default function Home() {
  const defaultCreator = getDefaultCreator();
  redirect(`/${defaultCreator.slug}`);
}
