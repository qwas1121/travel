"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { PhotoComment } from "@/lib/types";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function CommentPanel({
  driveFileId,
}: {
  driveFileId: string;
}) {
  const [comments, setComments] = useState<PhotoComment[] | null>(null);
  const [configured, setConfigured] = useState(true);
  const [viewer, setViewer] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/comments?fileId=${encodeURIComponent(driveFileId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setConfigured(data.configured !== false);
        setViewer(typeof data.viewer === "string" ? data.viewer : null);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [driveFileId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: driveFileId, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "댓글을 저장하지 못했습니다.");
        return;
      }
      setComments((prev) => [...(prev ?? []), data.comment]);
      setBody("");
    } catch {
      setSubmitError("댓글을 저장하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-hairline bg-surface">
      <div className="border-b border-hairline px-4 py-2.5">
        <span className="text-sm font-semibold text-fg">
          댓글{comments && comments.length > 0 ? ` ${comments.length}` : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loadError ? (
          <p className="py-4 text-center text-sm text-muted">
            댓글을 불러오지 못했어요.
          </p>
        ) : comments === null ? (
          <p className="py-4 text-center text-sm text-muted">불러오는 중...</p>
        ) : !configured ? (
          <p className="py-4 text-center text-sm text-muted">
            댓글 기능을 쓰려면 Supabase 설정이 필요해요.
          </p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold text-fg">
                    {comment.authorName}
                  </span>
                  <span className="text-[11px] text-muted">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-fg">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {configured && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 border-t border-hairline p-3"
        >
          {submitError && <p className="text-xs text-accent">{submitError}</p>}
          <div className="flex gap-2">
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={viewer ? `${viewer}(으)로 댓글 남기기` : "댓글을 남겨보세요"}
              maxLength={500}
              className="flex-1 rounded-lg border border-hairline bg-black/20 px-2.5 py-2 text-[13px] text-fg outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={submitting || !body.trim() || !viewer}
              className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-white transition disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
