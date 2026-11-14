import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuoteForm from "./QuoteForm";

export const dynamic = "force-dynamic";

export default async function SubmitQuotePage({ params }) {
  const { id } = await params;
  const requirement = await prisma.requirement.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, quantity: true, location: true, status: true },
  });
  if (!requirement || requirement.status !== "OPEN") notFound();
  return <QuoteForm requirement={requirement} />;
}
