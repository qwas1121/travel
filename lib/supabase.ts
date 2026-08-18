import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PhotoComment } from "./types";

let cachedClient: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, key, { auth: { persistSession: false } });
  return cachedClient;
}

export type FolderOverride = {
  slug: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number | null;
  coverDriveFileId: string | null;
};

async function getFolderOverrides(
  table: "trips" | "albums"
): Promise<Map<string, FolderOverride>> {
  const supabase = getClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from(table)
    .select("drive_folder_id, slug, title, description, sort_order, cover_drive_file_id");

  if (error || !data) return new Map();

  return new Map(
    data.map((row) => [
      row.drive_folder_id as string,
      {
        slug: (row.slug as string | null) ?? null,
        title: (row.title as string | null) ?? null,
        description: (row.description as string | null) ?? null,
        sortOrder: (row.sort_order as number | null) ?? null,
        coverDriveFileId: (row.cover_drive_file_id as string | null) ?? null,
      },
    ])
  );
}

/** drive_folder_id -> 트립 보강 정보. Supabase 미설정 시 빈 Map (Drive만으로 동작). */
export function getTripOverrides(): Promise<Map<string, FolderOverride>> {
  return getFolderOverrides("trips");
}

/** drive_folder_id -> 앨범 보강 정보. Supabase 미설정 시 빈 Map (Drive만으로 동작). */
export function getAlbumOverrides(): Promise<Map<string, FolderOverride>> {
  return getFolderOverrides("albums");
}

export type PhotoOverride = {
  caption: string | null;
  sortOrder: number | null;
};

/** drive_file_id -> 캡션/순서 보강 정보. Supabase 미설정 또는 앨범 미등록 시 빈 Map. */
export async function getPhotoOverrides(driveFolderId: string): Promise<Map<string, PhotoOverride>> {
  const supabase = getClient();
  if (!supabase) return new Map();

  const { data: album } = await supabase
    .from("albums")
    .select("id")
    .eq("drive_folder_id", driveFolderId)
    .maybeSingle();

  if (!album) return new Map();

  const { data, error } = await supabase
    .from("photo_captions")
    .select("drive_file_id, caption, sort_order")
    .eq("album_id", album.id);

  if (error || !data) return new Map();

  return new Map(
    data.map((row) => [
      row.drive_file_id as string,
      {
        caption: (row.caption as string | null) ?? null,
        sortOrder: (row.sort_order as number | null) ?? null,
      },
    ])
  );
}

function mapCommentRow(row: Record<string, unknown>): PhotoComment {
  return {
    id: row.id as string,
    driveFileId: row.drive_file_id as string,
    authorName: row.author_name as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

/** 특정 사진의 댓글 목록. Supabase 미설정이면 configured: false. */
export async function getPhotoComments(
  driveFileId: string
): Promise<{ configured: boolean; comments: PhotoComment[] }> {
  const supabase = getClient();
  if (!supabase) return { configured: false, comments: [] };

  const { data, error } = await supabase
    .from("photo_comments")
    .select("id, drive_file_id, author_name, body, created_at")
    .eq("drive_file_id", driveFileId)
    .order("created_at", { ascending: true });

  if (error || !data) return { configured: true, comments: [] };

  return { configured: true, comments: data.map(mapCommentRow) };
}

/** 앨범의 메모(description)를 추가하거나 수정합니다. 해당 앨범 행이 없으면 새로 만듭니다. */
export async function upsertAlbumMemo(
  driveFolderId: string,
  description: string
): Promise<void> {
  const supabase = getClient();
  if (!supabase) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  const { error } = await supabase
    .from("albums")
    .upsert(
      { drive_folder_id: driveFolderId, description },
      { onConflict: "drive_folder_id" }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function addPhotoComment(
  driveFileId: string,
  authorName: string,
  body: string
): Promise<PhotoComment> {
  const supabase = getClient();
  if (!supabase) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  const { data, error } = await supabase
    .from("photo_comments")
    .insert({ drive_file_id: driveFileId, author_name: authorName, body })
    .select("id, drive_file_id, author_name, body, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "댓글을 저장하지 못했습니다.");
  }

  return mapCommentRow(data);
}
