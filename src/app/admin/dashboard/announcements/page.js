"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { announcementService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminAnnouncementsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = () => {
    const res = announcementService.getAll({
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
    const unsub = announcementService.subscribe(loadData);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      announcementService.unpublish(item.id);
      toast.info("Announcement moved to draft.");
    } else {
      if (!item.title?.om || !item.title?.am || !item.title?.en) {
        toast.warning("Title in all 3 languages is recommended before publishing.");
      }
      announcementService.publish(item.id);
      toast.success("Announcement published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      announcementService.delete(deleteTarget.id);
      toast.success("Announcement deleted successfully.");
      setDeleteTarget(null);
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
        categories={["Public Notice", "Consultation", "Advisory", "Support Forum"]}
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
