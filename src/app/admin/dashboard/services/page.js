"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { serviceService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminServicesListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = () => {
    const res = serviceService.getAll({
      search,
      status,
      page,
      limit: 8,
    });
    setData(res);
  };

  useEffect(() => {
    loadData();
    const unsub = serviceService.subscribe(loadData);
    return () => unsub();
  }, [search, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      serviceService.unpublish(item.id);
      toast.info("Service information moved to draft.");
    } else {
      serviceService.publish(item.id);
      toast.success("Service information published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      serviceService.delete(deleteTarget.id);
      toast.success("Service category deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete service.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Public & Informational Services Directory"
        subtitle="Manage public service guidance, category profiles, and Shaggar E-Service gateways"
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
        createHref="/admin/dashboard/services/create"
        createLabel="Add Service Category"
        editHrefPrefix="/admin/dashboard/services"
        viewHrefPrefix="/services"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No service categories found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Service Category"
        message="Are you sure you want to delete this service category?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
