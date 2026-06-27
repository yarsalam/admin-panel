"use client";
import { withPageProtection } from "@/components/withPageProtection";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPhaseWeights,
  getFeatureWeights,
  getDiversityParams,
  testScores,
} from "@/lib/api/product/queries/useAlgorithmTuning";
import SectionTitle from "@/components/ui/SectionTitle";
import CustomButton from "@/components/ui/CustomButton";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useSetPhaseWeight,
  useUpdateFeatureWeight,
} from "@/lib/api/product/mutations/useAlgorithmTuning";

function AlgorithmTuningPage() {
  const [selUserId, setSelUserId] = useState("");
  const { data: phaseWeights, isLoading: pwLoad } = useQuery({
    queryKey: ["phase-weights"],
    queryFn: getPhaseWeights,
  });
  const { data: featureWeights } = useQuery({
    queryKey: ["feature-weights", "main"],
    queryFn: () => getFeatureWeights("main"),
  });
  const { data: diversity } = useQuery({
    queryKey: ["diversity"],
    queryFn: getDiversityParams,
  });
  const {
    data: scores,
    refetch: runTest,
    isLoading: testLoad,
  } = useQuery({
    queryKey: ["test-scores", selUserId],
    queryFn: () => testScores(Number(selUserId), []),
    enabled: false,
  });

  // رفع باگ: هوک‌های mutation باید در بالای کامپوننت صدا زده شوند، نه داخل onBlur/mutationFn
  const updatePhaseMut = useSetPhaseWeight();
  const updateFeatureMut = useUpdateFeatureWeight();

  return (
    <div className="space-y-8 p-4">
      <SectionTitle>تنظیم الگوریتم</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">وزن‌های فاز</h3>
          {pwLoad ? (
            <Skeleton />
          ) : (
            <ul>
              {Object.entries(phaseWeights || {}).map(([key, val]) => (
                <li
                  key={key}
                  className="flex justify-between items-center mb-1"
                >
                  <span>
                    {key}: {Number(val).toFixed(2)}
                  </span>
                  <input
                    type="number"
                    defaultValue={Number(val)}
                    className="w-16 border rounded px-1"
                    onBlur={(e) =>
                      updatePhaseMut.mutate({
                        key,
                        value: Number(e.target.value),
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">وزن‌های ویژگی‌ها</h3>
          {featureWeights ? (
            <ul>
              {featureWeights.map((w: number, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>
                    ویژگی {i + 1}: {w.toFixed(3)}
                  </span>
                  <input
                    type="number"
                    defaultValue={w}
                    className="w-16 border rounded px-1"
                    onBlur={(e) =>
                      updateFeatureMut.mutate({
                        type: "main",
                        index: i,
                        value: Number(e.target.value),
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">پارامتر تنوع</h3>
          {diversity && <p>Epsilon (اکتشاف): {diversity.epsilon}</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-bold mb-2">تست امتیازدهی</h3>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="شناسه کاربر"
            value={selUserId}
            onChange={(e) => setSelUserId(e.target.value)}
            className="border rounded p-2"
          />
          <CustomButton
            onClick={() => runTest()}
            label="اجرای تست"
            loading={testLoad}
          />
        </div>
        {scores && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {scores.map((s: any, i: number) => (
              <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {s.nickname}: {s.score?.toFixed(1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageProtection(AlgorithmTuningPage, {
  panelPermission: "view_product_panel",
  itemPermissions: "edit_content",
});
