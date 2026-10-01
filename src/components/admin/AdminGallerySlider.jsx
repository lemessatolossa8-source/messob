import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, Eye, Edit, EyeOff } from 'lucide-react';
import { galleryService } from '@/src/services';
import { useToast } from '@/src/context/ToastContext';
import ConfirmDialog from '@/components/admin/confirm-dialog';

export default function AdminGallerySlider() {
  const [items, setItems] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadItems = () => {
    const res = galleryService.getAll({ limit: 20, status: 'all' });
    setItems(res.items);
  };

  useEffect(() => {
    loadItems();
    const unsub = galleryService.subscribe(loadItems);
    return () => unsub();
  }, []);

  const handleTogglePublish = (item) => {
    if (item.status === 'published') {
      galleryService.unpublish(item.id);
      toast.info('Image moved to draft.');
    } else {
      galleryService.publish(item.id);
      toast.success('Image published successfully!');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      galleryService.delete(deleteTarget.id);
      toast.success('Gallery item deleted successfully.');
      setDeleteTarget(null);
    } catch (e) {
      toast.error('Failed to delete gallery item.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-gallery-slider">
      <div className="slider-header flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Media Gallery Slides</h2>
        <Link
          href="/admin/dashboard/gallery/create"
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
        >
          Add New Image
        </Link>
      </div>
      <div className="slider-container">
        {items.map((item) => (
          <div key={item.id} className="slide-card">
            <div className="image-wrapper">
              <img src={item.image} alt={item.title?.en || 'Gallery image'} />
            </div>
            <div className="caption text-sm mt-2 truncate">
              {item.title?.en || item.title?.om || item.title?.am}
            </div>
            <div className="actions flex space-x-2 mt-2">
              <Link
                href={`/admin/dashboard/gallery/${item.id}`}
                className="btn edit-btn rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-800 hover:bg-slate-300 transition"
              >
                <Edit className="inline-block h-3 w-3" /> Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="btn delete-btn rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-800 hover:bg-rose-200 transition"
              >
                <Trash2 className="inline-block h-3 w-3" /> Delete
              </button>
              <button
                type="button"
                onClick={() => handleTogglePublish(item)}
                className="btn publish-btn rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-200 transition"
              >
                {item.status === 'published' ? (
                  <><EyeOff className="inline-block h-3 w-3" /> Draft</>
                ) : (
                  <><Eye className="inline-block h-3 w-3" /> Publish</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this media asset?"
        itemName={deleteTarget?.title?.en || deleteTarget?.title?.om || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
