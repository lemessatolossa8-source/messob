"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { eventService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";

export default function AdminEventsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = () => {
    const res = eventService.getAll({
      search,
      status,
      page,
      limit: 8,
    });
    setData(res);
  };

  useEffect(() => {
    loadData();
    const unsub = eventService.subscribe(loadData);
    return () => unsub();
  }, [search, status, page]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      eventService.unpublish(item.id);
      toast.info("Event moved to draft.");
    } else {
      eventService.publish(item.id);
      toast.success("Event published successfully!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      eventService.delete(deleteTarget.id);
      toast.success("Event deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DataTable
        title="Events & Consultations Management"
        subtitle="Manage civic town halls, exhibitions, forums, and environmental volunteer days"
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
        createHref="/admin/dashboard/events/create"
        createLabel="Add Event"
        editHrefPrefix="/admin/dashboard/events"
        viewHrefPrefix="/events"
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No events found."
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </>
  );
}
