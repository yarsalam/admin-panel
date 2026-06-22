"use client";
import { useUserImages } from "@/lib/api/safety/mutations/useUser360";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ImageGallery({ userId }: { userId: number }) {
  const { data: images, isLoading } = useUserImages(userId);

  if (isLoading) return <Skeleton className="h-40" />;
  if (!images || images.length === 0) return <p className="text-gray-500">هیچ تصویری یافت نشد</p>;

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((img: any) => (
        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden shadow">
          <img
            src={img.url}
            alt="user"
            className="object-cover w-full h-full"
            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
          />
          <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
            {img.moderationStatus || "نامشخص"}
          </span>
        </div>
      ))}
    </div>
  );
}