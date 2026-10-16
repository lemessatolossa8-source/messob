import { redirect } from "next/navigation";

export default async function FloorDetailPage({ params }) {
  const resolvedParams = await params;
  const floorNumber = resolvedParams?.floorNumber || "1";
  redirect(`/#floor-${floorNumber}`);
}
