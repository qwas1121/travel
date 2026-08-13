import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

export type AlbumOverride = {
  slug: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number | null;
  coverDriveFileId: string | null;
};

/** drive_folder_id -> 앨범 보강 정보. Supabase 미설정 시 빈 Map (Drive만으로 동작). */
export async function getAlbumOverrides(): Promise<Map<string, AlbumOverride>> {
  const supabase = getClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from("albums")
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
