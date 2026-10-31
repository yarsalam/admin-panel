import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export type AiPackId = "matching-pack" | "seo-pack" | "revenue-pack" | "safety-pack";
export type AiPackAction = "start" | "stop" | "test";

export interface AiPackMemory {
  total_mb: number;
  available_mb: number;
  swap_total_mb: number;
  swap_free_mb: number;
}

export interface AiPackStatus {
  id: AiPackId;
  state: "not_installed" | "stopped" | "running" | "partial";
  running_containers: number;
  containers: Array<{
    name: string;
    service: string;
    state: string;
    health: string;
    exit_code: number | null;
    image: string;
  }>;
  gateway: {
    status?: string;
    http_status?: number | null;
    services?: Record<string, unknown>;
    [key: string]: unknown;
  };
  memory: Array<{ container: string; usage: string }>;
  ready_to_start: boolean;
  preflight_reason?: string;
  missing_images?: string[];
}

export interface AiPackControlStatus {
  timestamp: string;
  memory: AiPackMemory;
  packs: Record<AiPackId, AiPackStatus>;
  operation_running: boolean;
}

export interface AiPackJob {
  id: string;
  kind: string;
  state: "queued" | "running" | "completed" | "failed";
  step: string;
  created_at: string;
  updated_at: string;
  min_available_mb: number;
  current_memory?: AiPackMemory;
  result?: any;
  error?: string | null;
}

export function useAiPackControlStatus() {
  return useQuery<AiPackControlStatus>({
    queryKey: ["ai-pack-control", "status"],
    queryFn: () => apiClient.get("/infrastructure/ai-packs/status").then((r) => r.data),
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useAiPackJob(jobId: string | null) {
  return useQuery<AiPackJob>({
    queryKey: ["ai-pack-control", "job", jobId],
    queryFn: () => apiClient.get("/infrastructure/ai-packs/jobs/" + jobId).then((r) => r.data),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === "completed" || state === "failed") return false;
      return 2_000;
    },
    refetchOnWindowFocus: true,
  });
}

export function useAiPackControlAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input:
      | { kind: "pack"; pack: AiPackId; action: AiPackAction }
      | { kind: "progressive" }
      | { kind: "stop-all" }
    ) => {
      if (input.kind === "pack") {
        return apiClient.post(
          "/infrastructure/ai-packs/packs/" + input.pack + "/" + input.action,
          {},
        ).then((r) => r.data);
      }
      if (input.kind === "progressive") {
        return apiClient.post("/infrastructure/ai-packs/progressive-test", {}).then((r) => r.data);
      }
      return apiClient.post("/infrastructure/ai-packs/stop-all", { confirm: true }).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-pack-control", "status"] });
    },
  });
}
