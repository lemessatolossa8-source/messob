"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { newsService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { NEWS_CATEGORIES } from "@/src/constants/categories";

export default function AdminNewsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadNews = async () => {
    try {
      const res = await newsService.getAll({
        search,
        category,
        status,
        page,
        limit: 8,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load news:", err);
    }
  };

  useEffect(() => {
    loadNews();
    const unsub = newsService.subscribe(loadNews);
    return () => unsub();
  }, [search, category, status, page]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await newsService.unpublish(item.id);
        toast.info("News item moved to draft.");
      } else {
        if (!item.title?.om || !item.title?.am || !item.title?.en) {
          toast.warning("Title in all 3 languages (Afaan Oromo, አማርኛ, English) is recommended before publishing.");
        }
        await newsService.publish(item.id);
        toast.success("News item published successfully!");
      }
      loadNews();
    } catch (err) {
      toast.error("Failed to update publish status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await newsService.delete(deleteTarget.id);
      toast.success("News item deleted successfully.");
      setDeleteTarget(null);
      loadNews();
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
        categories={NEWS_CATEGORIES}
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
