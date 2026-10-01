"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { newsService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminNewsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadNews = () => {
    const res = newsService.getAll({
      search,
      category,
      status,
      page,
      limit: 8,
    });
    setData(res);
  };

  useEffect(() => {
    loadNews();
    const unsub = newsService.subscribe(loadNews);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      newsService.unpublish(item.id);
      toast.info("News item moved to draft.");
    } else {
      // Validate multilingual title
      if (!item.title?.om || !item.title?.am || !item.title?.en) {
        toast.warning("Title in all 3 languages (OM, AM, EN) is recommended before publishing.");
      }
      newsService.publish(item.id);
      toast.success("News item published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      newsService.delete(deleteTarget.id);
      toast.success("News item deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete news item.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="News Management"
        subtitle="Create, edit, publish, and manage verified municipal news articles"
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
        categories={["Community", "Infrastructure", "Urban Planning", "Economic Development", "Digital Services", "Investment", "Commerce"]}
        onCategoryFilterChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/news/create"
        createLabel="Add News Article"
        editHrefPrefix="/admin/dashboard/news"
        viewHrefPrefix="/news"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No news articles found. Try changing filters or create a new article."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete News Article"
        message="Are you sure you want to permanently delete this news story? This cannot be undone."
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
