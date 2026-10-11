import GlobalText from "./GlobalText";

export default function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
      <GlobalText as="h2" className="text-xl font-bold text-gray-800 dark:text-gray-200">
        {children}
      </GlobalText>
    </div>
  );
}
