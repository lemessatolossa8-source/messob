import { redirect } from "next/navigation";

export default async function AdminProjectsEditRedirect({ params }) {
  const resolvedParams = await params;
  redirect(`/admin/dashboard/projects/${resolvedParams.id}/edit`);
}
