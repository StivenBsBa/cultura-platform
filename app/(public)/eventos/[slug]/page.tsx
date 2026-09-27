import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventService } from "@/lib/services/event.service";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { Box, Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
const cleanJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const event = await eventService.findPublicBySlug((await params).slug);
  return event
    ? {
        title: event.name,
        description: (event.summary ?? "").slice(0, 160),
        alternates: { canonical: `/eventos/${event.slug}` },
        openGraph: {
          title: event.name,
          description: (event.summary ?? "").slice(0, 160),
        },
      }
    : {};
}
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await eventService.findPublicBySlug((await params).slug);
  if (!event) notFound();
  const occurrence = event.occurrences[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.summary ?? "",
    startDate: occurrence?.startsAt.toISOString(),
    endDate: occurrence?.endsAt.toISOString(),
    location: { "@type": "Place", name: event.place.name, address: event.place.address },
  };
  return (
    <PageContainer component="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJson(jsonLd) }} />
      <Typography component="p" color="text.secondary">
        {event.place.city.name}
      </Typography>
      <Typography component="h1" variant="h3">
        {event.name}
      </Typography>
      {event.coverMedia?.url && (
        <Box
          component="img"
          src={event.coverMedia.url}
          alt=""
          sx={{ width: "100%", maxHeight: 448, objectFit: "cover", borderRadius: 2 }}
        />
      )}
      <Typography component="p">{event.summary ?? ""}</Typography>
      <RichTextRenderer content={event.content as never} />
      <Typography component="p">
        <strong>Precio:</strong> ${event.price.toString()}
      </Typography>
    </PageContainer>
  );
}
