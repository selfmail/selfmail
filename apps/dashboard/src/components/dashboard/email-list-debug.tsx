import { useEffect, useState } from "react";
import { client } from "@/lib/client";

export default function EmailListDebug() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPI() {
      try {
        console.log("Testing API call...");

        // Test direct fetch first
        const directResponse = await fetch(
          "http://localhost:3000/v1/web/emails?page=1&limit=5",
        );
        console.log(
          "Direct fetch response:",
          directResponse.status,
          directResponse.statusText,
        );

        if (!directResponse.ok) {
          throw new Error(`Direct fetch failed: ${directResponse.status}`);
        }

        const directData = await directResponse.json();
        console.log("Direct fetch data:", directData);

        // Test Eden client
        console.log("Testing Eden client...");
        const response = await client.v1.web.emails.get({
          query: {
            page: 1,
            limit: 5,
          },
        });

        console.log("Eden response:", response);

        if (response.error) {
          throw new Error(
            "Eden client error: " + JSON.stringify(response.error),
          );
        }

        setResult(response.data);
      } catch (err) {
        console.error("API test error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    testAPI();
  }, []);

  if (loading) return <div>Testing API connection...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>API Test Results:</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
