"use client";

import { useState } from "react";

export default function MemoEditor({
  driveFolderId,
  initialDescription,
}: {
  driveFolderId: string;
  initialDescription: string | null;
}) {
  const [description, setDescription] = useState(initialDescription);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveFolderId, description: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "메모를 저장하지 못했습니다.");
        return;
      }
      setDescription(trimmed);
      setEditing(false);
    } catch {
      setError("메모를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div
        className="rounded-[18px] border border-hairline p-4"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="mb-2 text-[10.5px] font-bold tracking-wide text-accent">
          MEMO
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          autoFocus
          placeholder="이 앨범에 대한 기록을 남겨보세요"
          className="w-full resize-none rounded-lg border border-hairline bg-black/20 p-3 text-[13.5px] text-fg outline-none focus:border-accent"
        />
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDraft(description ?? "");
              setError(null);
            }}
            className="rounded-lg px-3 py-1.5 text-[13px] text-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !draft.trim()}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-medium text-white transition disabled:opacity-40"
          >
            저장
          </button>
        </div>
      </div>
    );
  }

  if (description) {
    return (
      <div
        className="rounded-[18px] border border-hairline p-4"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10.5px] font-bold tracking-wide text-accent">
            MEMO
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[11px] text-muted underline"
          >
            수정
          </button>
        </div>
        <div className="text-[13.5px] leading-relaxed text-fg">
          {description}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="rounded-[18px] border border-dashed border-hairline p-4 text-left text-[13px] text-muted transition hover:border-accent hover:text-accent"
    >
      + 메모 추가
    </button>
  );
}
