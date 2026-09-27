import { requireAdmin } from "@/lib/auth/guards";
import { currentActor } from "@/lib/auth/session";
import { userRepository } from "@/lib/repositories/user.repository";
import { UsersTable } from "@/components/admin/users-table";
import { Typography } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";

export default async function ManagedUsersPage() {
  await requireAdmin();
  const actor = await currentActor();
  const users = await userRepository.findMany(0, 100, undefined, actor?.id);

  return (
    <PageContainer component="main">
      <Typography component="h1" variant="h3">
        Usuarios
      </Typography>
      <Typography component="p" color="text.secondary">
        Los cambios de rol se realizan exclusivamente mediante `PATCH /api/v1/admin/users` y se
        validan server-side.
      </Typography>
      <UsersTable
        initial={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() }))}
      />
    </PageContainer>
  );
}
