import { getServerSession } from "next-auth";
import { Role } from "@/generated/prisma/client";
import { authOptions } from "./options";
import { userRepository } from "@/lib/repositories/user.repository";

export async function currentActor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  // La sesión identifica al usuario, pero la autorización siempre usa el rol
  // actual de la base de datos (evita privilegios obsoletos en JWT largos).
  const user = await userRepository.findPublicById(session.user.id);
  if (!user) return null;
  return { id: user.id, role: user.role as Role };
}
