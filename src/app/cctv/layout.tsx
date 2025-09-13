import ProtectedRoute from "@/components/ProtectedRoute";
import CCTVPlayer from "@/components/CCTVPlayer";
import { TuyaContext } from "@tuya/tuya-connector-nodejs";

interface TuyaStreamResponse {
  result?: {
    url?: string;
  };
  success?: boolean;
}

export default async function CCTVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tuya = new TuyaContext({
    baseUrl: process.env.NEXT_PUBLIC_TUYA_ENDPOINT || "",
    accessKey: process.env.NEXT_PUBLIC_TUYA_ACCESS_ID || "",
    secretKey: process.env.NEXT_PUBLIC_TUYA_ACCESS_KEY || "",
  });

  const streamURL = (await tuya.request({
    method: "POST",
    path: "/v1.0/users/az1588835336695CrPbk/devices/eba8d5c9ceba57e27b4qla/stream/actions/allocate",
    body: {
      type: "HLS",
      stream_type: 0 
    },
  })) as TuyaStreamResponse;

  const realStreamURL = streamURL?.result?.url || "";

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6">
        {/* Video Player Container - Larger for higher resolution */}
        <div style={{ maxWidth: "800px", width: "100%" }}>
          <CCTVPlayer streamURL={realStreamURL} />
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}
