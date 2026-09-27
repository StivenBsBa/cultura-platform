import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ContentStatus, Role } from "../generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { Prisma } from "../generated/prisma/client";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
async function main() {
  const country = await prisma.country.upsert({
    where: { code: "CO" },
    update: {},
    create: { name: "Colombia", code: "CO", slug: "colombia" },
  });
  const region = await prisma.region.upsert({
    where: { countryId_slug: { countryId: country.id, slug: "antioquia" } },
    update: {},
    create: { name: "Antioquia", slug: "antioquia", countryId: country.id },
  });
  const city = await prisma.city.upsert({
    where: { regionId_slug: { regionId: region.id, slug: "medellin" } },
    update: {},
    create: { name: "Medellín", slug: "medellin", regionId: region.id },
  });
  const categories = await Promise.all(
    [
      "Museos",
      "Arte",
      "Música",
      "Teatro",
      "Historia",
      "Naturaleza",
      "Gastronomía",
      "Festivales",
    ].map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase() },
        update: {},
        create: { name, slug: name.toLowerCase() },
      }),
    ),
  );
  const passwordHash = await hashPassword("LocalDevOnly123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Admin local", email: "admin@example.com", passwordHash, role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      name: "Creador local",
      email: "creator@example.com",
      passwordHash,
      role: Role.CREATOR,
    },
  });
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: { name: "Usuario local", email: "user@example.com", passwordHash, role: Role.USER },
  });
  const demos = [
    {
      name: "Museo de Antioquia",
      slug: "museo-de-antioquia",
      address: "Cra. 52 #52-43, Medellín",
      lat: 6.2518,
      lng: -75.5684,
    },
    {
      name: "Jardín Botánico de Medellín",
      slug: "jardin-botanico-medellin",
      address: "Cl. 73 #51D-14, Medellín",
      lat: 6.2707,
      lng: -75.5654,
    },
    {
      name: "Plaza Botero",
      slug: "plaza-botero",
      address: "Cra. 52 con Cl. 52, Medellín",
      lat: 6.2512,
      lng: -75.5687,
    },
    {
      name: "Parque Arví",
      slug: "parque-arvi",
      address: "Santa Elena, Medellín",
      lat: 6.2876,
      lng: -75.5037,
    },
  ];
  for (const demo of demos) {
    const place = await prisma.place.upsert({
      where: { slug: demo.slug },
      update: {},
      create: {
        name: demo.name,
        slug: demo.slug,
        summary: `${demo.name} es un lugar de demostración para desarrollo local.`,
        address: demo.address,
        status: ContentStatus.PUBLISHED,
        cityId: city.id,
        authorId: admin.id,
      },
    });
    await prisma.$executeRaw(
      Prisma.sql`UPDATE "Place" SET location = ST_SetSRID(ST_MakePoint(${demo.lng}, ${demo.lat}), 4326)::geography WHERE id = ${place.id}`,
    );
  }
  const place = await prisma.place.findUniqueOrThrow({ where: { slug: "museo-de-antioquia" } });
  await prisma.event.upsert({
    where: { slug: "demo-taller-de-historia-local" },
    update: {},
    create: {
      name: "[DEMO] Taller de historia local",
      slug: "demo-taller-de-historia-local",
      summary: "Evento ficticio creado exclusivamente para validar la plataforma local.",
      price: new Prisma.Decimal(25000),
      status: ContentStatus.PUBLISHED,
      placeId: place.id,
      authorId: admin.id,
      categories: { create: { categoryId: categories[4].id } },
      occurrences: {
        create: [
          {
            startsAt: new Date("2026-10-10T15:00:00-05:00"),
            endsAt: new Date("2026-10-10T17:00:00-05:00"),
            timezone: "America/Bogota",
            status: ContentStatus.PUBLISHED,
          },
          {
            startsAt: new Date("2026-10-17T15:00:00-05:00"),
            endsAt: new Date("2026-10-17T17:00:00-05:00"),
            timezone: "America/Bogota",
            status: ContentStatus.PUBLISHED,
          },
        ],
      },
    },
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
