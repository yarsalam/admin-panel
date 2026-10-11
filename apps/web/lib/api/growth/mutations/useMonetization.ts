import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import toast from "react-hot-toast";

const predictPromotion = (payload: {
  userId: number;
  features: any;
  candidates: string[];
}) =>
  apiClient.post("/growth/monetization/predict", payload).then((r) => r.data);

const sendFeedback = (payload: {
  userId: number;
  variant: string;
  features: any;
  label: number;
}) =>
  apiClient.post("/growth/monetization/feedback", payload).then((r) => r.data);

const retrainModel = () =>
  apiClient.post("/growth/monetization/retrain").then((r) => r.data);

const trainModel = () =>
  apiClient.post("/growth/monetization/train").then((r) => r.data);

export const usePredictPromotion = () =>
  useMutation({ mutationFn: predictPromotion });

export const useSendMonetizationFeedback = () =>
  useMutation({
    mutationFn: sendFeedback,
    onSuccess: () => toast.success("بازخورد با موفقیت ثبت شد"),
  });

export const useRetrainModel = () =>
  useMutation({
    mutationFn: retrainModel,
    onSuccess: () => toast.success("مدل با موفقیت بازآموزی شد"),
  });

export const useTrainModel = () =>
  useMutation({
    mutationFn: trainModel,
    onSuccess: () => toast.success("آموزش مدل آغاز شد"),
  });
