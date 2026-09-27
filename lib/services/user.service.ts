import { hashPassword } from "@/lib/auth/password";
import { userRepository } from "@/lib/repositories/user.repository";

export const userService = {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    if (await userRepository.findAuthByEmail(email)) throw new Error("EMAIL_EXISTS");
    try {
      return await userRepository.create({
        name: input.name.trim(),
        email,
        passwordHash: await hashPassword(input.password),
        // Nunca aceptar un rol proveniente del registro público.
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002")
        throw new Error("EMAIL_EXISTS");
      throw error;
    }
  },
  me: (id: string) => userRepository.findPublicById(id),
  profileStats: (id: string) => userRepository.profileStats(id),
  async updateProfile(id: string, input: { name?: string; image?: string | null }) {
    return userRepository.updateProfile(id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    });
  },
  async resetPassword(actorId: string, userId: string, temporaryPassword: string) {
    if (actorId === userId) throw new Error("FORBIDDEN");
    return userRepository.updatePassword(userId, await hashPassword(temporaryPassword), true);
  },
  async changeForcedPassword(id: string, password: string) {
    const user = await userRepository.findPublicById(id);
    if (!user) throw new Error("NOT_FOUND");
    if (!user.mustChangePassword) throw new Error("FORBIDDEN");
    return userRepository.updatePassword(id, await hashPassword(password), false);
  },
};
