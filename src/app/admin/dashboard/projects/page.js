"use client";

import { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { projectService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminProjectsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll({
        search,
        category,
        status,
        page,
        limit: 8,
      });
      setData(res);
    } catch (err) {
      toast.error("Failed to load projects: " + (err?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published" || item.is_published) {
        await projectService.unpublish(item.id);
        toast.info("Project moved to draft.");
      } else {
        await projectService.publish(item.id);
        toast.success("Project published successfully!");
      }
      loadData();
    } catch (err) {
      toast.error("Failed to update project status: " + (err?.message || "Server error"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectService.delete(deleteTarget.id);
      toast.success("Project deleted successfully.");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error("Failed to delete project: " + (err?.message || "Server error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Infrastructure & Development Projects"
        subtitle="Manage road corridors, water expansion, and municipal development initiatives"
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
        categories={["Infrastructure", "Commerce", "Water & Sanitation", "Digital Services"]}
        onCategoryFilterChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        onPageChange={setPage}
        createHref="/admin/dashboard/projects/create"
        createLabel="Add Project"
        editHrefPrefix="/admin/dashboard/projects"
        viewHrefPrefix="/projects"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage={loading ? "Loading projects..." : "No projects found."}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        message="Are you sure you want to delete this infrastructure project?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
