"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { noticeService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminNoticesListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = () => {
    const res = noticeService.getAll({
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
    const unsub = noticeService.subscribe(loadData);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      noticeService.unpublish(item.id);
      toast.info("Notice moved to draft.");
    } else {
      noticeService.publish(item.id);
      toast.success("Notice published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      noticeService.delete(deleteTarget.id);
      toast.success("Notice deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete notice.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Official Notices Management"
        subtitle="Manage critical public notices, tax advisories, and administrative instructions"
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
        categories={["Revenue", "Environment", "Urban Planning", "Safety"]}
        onCategoryFilterChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/notices/create"
        createLabel="Add Notice"
        editHrefPrefix="/admin/dashboard/notices"
        viewHrefPrefix="/notices"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No notices found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Notice"
        message="Are you sure you want to delete this notice?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
