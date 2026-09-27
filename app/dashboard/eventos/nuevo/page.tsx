import { redirect } from "next/navigation";

export default function NewDashboardEventPage() {
  redirect("/dashboard/gestion/eventos/nuevo");
}
