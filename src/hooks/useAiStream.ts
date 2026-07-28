// ============================================================
// PlanCraft AI — AI Streaming Hook
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";

interface UseAiStreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

export function useAiStream(options: UseAiStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      setIsStreaming(true);
      setContent("");
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          fullContent += text;
          setContent(fullContent);
          options.onChunk?.(text);
        }

        setIsStreaming(false);
        options.onComplete?.(fullContent);
        return fullContent;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsStreaming(false);
          return content;
        }
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setIsStreaming(false);
        options.onError?.(errorMessage);
        throw err;
      }
    },
    [options, content]
  );

  const fetchJson = useCallback(
    async <T>(url: string, body: Record<string, unknown>): Promise<T> => {
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setIsStreaming(false);
        return data as T;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setIsStreaming(false);
        throw err;
      }
    },
    []
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    stream,
    fetchJson,
    abort,
    reset,
    isStreaming,
    content,
    error,
  };
}
