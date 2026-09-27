import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { currentActor } from "@/lib/auth/session";
import { PageContainer } from "@/components/ui/page-container";
export default async function LoginPage() {
  if (await currentActor()) redirect("/dashboard");
  return (
    <PageContainer
      component="main"
      sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}
    >
      <LoginForm />
    </PageContainer>
  );
}
