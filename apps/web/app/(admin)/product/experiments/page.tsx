"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runAB } from "@/lib/api/product/mutations/useExperiments";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";

export default function ExperimentsPage() {
  const [userId, setUserId] = useState("");
  const [variantA, setVariantA] = useState("off1");
  const [variantB, setVariantB] = useState("off2");
  const abMut = useMutation({
    mutationFn: (data: {
      userId: number;
      variantA: string;
      variantB: string;
    }) => runAB(data.userId, data.variantA, data.variantB),
  });

  return (
    <div className="p-4 space-y-6">
      <SectionTitle>آزمایش A/B</SectionTitle>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-3 max-w-md">
        <input
          type="number"
          placeholder="شناسه کاربر"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="نوع A"
          value={variantA}
          onChange={(e) => setVariantA(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="نوع B"
          value={variantB}
          onChange={(e) => setVariantB(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <CustomButton
          onClick={() =>
            abMut.mutate({ userId: Number(userId), variantA, variantB })
          }
          label="اجرای تست"
          gradient
          loading={abMut.isPending}
        />
        {abMut.data && (
          <pre className="text-sm">{JSON.stringify(abMut.data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
