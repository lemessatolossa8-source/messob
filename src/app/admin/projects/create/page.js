import { redirect } from "next/navigation";

export default function AdminProjectsCreateRedirect() {
  redirect("/admin/dashboard/projects/create");
}
