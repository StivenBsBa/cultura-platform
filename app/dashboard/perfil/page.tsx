import { requireUser } from "@/lib/auth/guards";
import { userRepository } from "@/lib/repositories/user.repository";
import { MyProfileCard } from "@/components/profile/my-profile-card";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
export default async function ProfilePage() {
  const actor = await requireUser();
  const [user, stats] = await Promise.all([
    userRepository.findPublicById(actor.id),
    userRepository.profileStats(actor.id),
  ]);
  if (!user) return null;
  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
        Mi perfil
      </Typography>
      <MyProfileCard initial={{ ...user, createdAt: user.createdAt.toISOString() }} stats={stats} />
    </PageContainer>
  );
}
