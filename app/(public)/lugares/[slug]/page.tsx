import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { placeService } from "@/lib/services/place.service";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { Box, Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
const cleanJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const place = await placeService.findPublicBySlug((await params).slug);
  return place
    ? {
        title: place.name,
        description: (place.summary ?? "").slice(0, 160),
        alternates: { canonical: `/lugares/${place.slug}` },
        openGraph: {
          title: place.name,
          description: (place.summary ?? "").slice(0, 160),
        },
      }
    : {};
}
export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const place = await placeService.findPublicBySlug((await params).slug);
  if (!place) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: place.summary ?? "",
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: place.city.name,
    },
  };
  return (
    <PageContainer component="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJson(jsonLd) }} />
      <Typography component="p" color="text.secondary">
        {place.city.name}, {place.city.region.country.name}
      </Typography>
      <Typography component="h1" variant="h3">
        {place.name}
      </Typography>
      {place.coverMedia?.url && (
        <Box
          component="img"
          src={place.coverMedia.url}
          alt=""
          sx={{ width: "100%", maxHeight: 448, objectFit: "cover", borderRadius: 2 }}
        />
      )}
      <Typography component="p">{place.summary ?? ""}</Typography>
      <RichTextRenderer content={place.content as never} />
      <Typography component="p">{place.address}</Typography>
    </PageContainer>
  );
}
