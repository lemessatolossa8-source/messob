"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { galleryService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminGalleryListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      const res = await galleryService.getAll({
        search,
        category,
        status,
        page,
        limit: 8,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = galleryService.subscribe(loadData);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await galleryService.unpublish(item.id);
        toast.info("Image moved to draft.");
      } else {
        await galleryService.publish(item.id);
        toast.success("Image published successfully!");
      }
      loadData();
    } catch {
      toast.error("Failed to update publish status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await galleryService.delete(deleteTarget.id);
      toast.success("Gallery item deleted successfully.");
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Failed to delete gallery item.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Our Gallery Management"
        subtitle="Manage official municipal photographs and civic archives"
        items={data.items}
        total={data.total}
        currentPage={page}
        totalPages={data.totalPages}
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        statusFilter={status}
        onStatusFilterChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/gallery/create"
        createLabel="Add Image"
        editHrefPrefix="/admin/dashboard/gallery"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No gallery items found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item, including its title?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") || "this image" : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
