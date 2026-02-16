import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  const { get } = useApi();
  
  // Fetch users on component mount
  useEffect(() => {
    fetchDemo();
  }, []);

  // Example of how to fetch data from the server (if needed)
  const fetchDemo = async () => {
    try {
      const data = await get("/demo", "Loading demo data...");
      if (data && typeof data === 'object' && 'message' in data) {
        setExampleFromServer((data as any).message);
      }
    } catch (error) {
      console.error("Error fetching hello:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center space-y-6">
        {/* TODO: FUSION_GENERATION_APP_PLACEHOLDER replace everything here with the actual app! */}
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center justify-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-slate-400"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-slate-600"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
          Generating your app...
        </h1>
        <div className="space-y-4">
          <p className="text-slate-600 max-w-md mx-auto">
            Watch the chat on the left for updates that might need your attention
            to finish generating
          </p>
          <p className="hidden max-w-md mx-auto">{exampleFromServer}</p>
        </div>
      </div>
    </div>
  );
}
