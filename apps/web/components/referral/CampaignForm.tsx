import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignFormSchema } from "@/schemas/growth/referral";
import { useCreateCampaign } from "@/lib/api/growth/queries/useReferrals";
import FormInput from "@/components/ui/FormInput";
import CustomButton from "@/components/ui/CustomButton";

export default function CampaignForm({ onClose }: { onClose: () => void }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(campaignFormSchema),
  });
  const createMutation = useCreateCampaign();

  const onSubmit = (data: any) => {
    createMutation.mutate(data, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">ایجاد کمپین جدید</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="name"
            control={control}
            label="نام کمپین"
            type="text"
          />
          <FormInput
            name="description"
            control={control}
            label="توضیحات"
            type="textarea"
          />
          <FormInput
            name="rewardType"
            control={control}
            label="نوع پاداش"
            type="dropdown"
            dropdownItems={[
              { label: "روز VIP", value: "vip_days" },
              { label: "اعتبار", value: "credit" },
              { label: "بوست", value: "boost" },
            ]}
          />
          <FormInput
            name="rewardValue"
            control={control}
            label="مقدار"
            type="text"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" {...control.register("bothRewarded")} />
            <label>پاداش به هر دو نفر</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              انصراف
            </button>
            <CustomButton
              label="ایجاد"
              gradient
              loading={createMutation.isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
