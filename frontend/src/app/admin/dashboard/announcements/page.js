"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { announcementService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { ANNOUNCEMENT_CATEGORIES } from "@/src/constants/categories";

export default function AdminAnnouncementsListPage() {
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
      const res = await announcementService.getAll({
        search,
        category,
        status,
        page,
        limit: 8,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = announcementService.subscribe(loadData);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await announcementService.unpublish(item.id);
        toast.info("Announcement moved to draft.");
      } else {
        if (!item.title?.om || !item.title?.am || !item.title?.en) {
          toast.warning("Title in all 3 languages is recommended before publishing.");
        }
        await announcementService.publish(item.id);
        toast.success("Announcement published successfully!");
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
      await announcementService.delete(deleteTarget.id);
      toast.success("Announcement deleted successfully.");
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Failed to delete announcement.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Announcements Management"
        subtitle="Manage public announcements, time-sensitive schedules, and administrative notices"
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
        categories={ANNOUNCEMENT_CATEGORIES}
        onCategoryFilterChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/announcements/create"
        createLabel="Add Announcement"
        editHrefPrefix="/admin/dashboard/announcements"
        viewHrefPrefix="/announcements"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No announcements found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
