"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
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

  const loadData = () => {
    const res = galleryService.getAll({
      search,
      category,
      status,
      page,
      limit: 8,
    });
    setData(res);
  };

  useEffect(() => {
    loadData();
    const unsub = galleryService.subscribe(loadData);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      galleryService.unpublish(item.id);
      toast.info("Image moved to draft.");
    } else {
      galleryService.publish(item.id);
      toast.success("Image published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      galleryService.delete(deleteTarget.id);
      toast.success("Gallery item deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete gallery item.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Media Gallery Management"
        subtitle="Manage official municipal photographs, civic archives, and project media"
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
        categoryFilter={category}
        categories={["Administration", "Civic", "Projects", "Commerce", "Environment", "Digital"]}
        onCategoryFilterChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/gallery/create"
        createLabel="Add Image"
        editHrefPrefix="/admin/dashboard/gallery"
        viewHrefPrefix="/gallery"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No gallery items found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this media asset?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
