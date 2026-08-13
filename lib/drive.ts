import { google } from "googleapis";
import { Readable } from "node:stream";
import type { Album, Photo } from "./types";
import { getAlbumOverrides, getPhotoOverrides } from "./supabase";

const FOLDER_MIME = "application/vnd.google-apps.folder";

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY 환경 변수가 필요합니다."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

function getRootFolderId(): string {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID 환경 변수가 필요합니다.");
  }
  return rootFolderId;
}

function titleFromFolderName(name: string): string {
  return name.replace(/^\d+[_\-\s]*/, "").replace(/_/g, " ").trim() || name;
}

function slugify(input: string): string {
  const slug = input
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "album";
}

export async function listAlbums(): Promise<Album[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${getRootFolderId()}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 200,
  });

  const folders = (res.data.files ?? []).filter(
    (f): f is { id: string; name: string } => Boolean(f.id && f.name)
  );
  const overrides = await getAlbumOverrides();

  const draft = folders.map((folder, index) => {
    const override = overrides.get(folder.id);
    const title = override?.title ?? titleFromFolderName(folder.name);
    return {
      driveFolderId: folder.id,
      baseSlug: override?.slug ?? slugify(title),
      title,
      description: override?.description ?? null,
      sortOrder: override?.sortOrder ?? index,
      coverDriveFileId: override?.coverDriveFileId ?? null,
    };
  });

  const usedSlugs = new Set<string>();
  const albums: Album[] = draft
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ baseSlug, ...rest }) => {
      let slug = baseSlug;
      let n = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${n++}`;
      }
      usedSlugs.add(slug);
      return { slug, ...rest };
    });

  return albums;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const albums = await listAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}

export async function getAlbumCoverThumbnail(
  album: Pick<Album, "driveFolderId" | "coverDriveFileId">
): Promise<string | null> {
  const drive = getDriveClient();

  if (album.coverDriveFileId) {
    const res = await drive.files.get({
      fileId: album.coverDriveFileId,
      fields: "thumbnailLink",
    });
    if (res.data.thumbnailLink) return res.data.thumbnailLink;
  }

  const res = await drive.files.list({
    q: `'${album.driveFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(thumbnailLink)",
    orderBy: "name",
    pageSize: 1,
  });
  return res.data.files?.[0]?.thumbnailLink ?? null;
}

export async function listPhotos(driveFolderId: string): Promise<Photo[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${driveFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id, name, thumbnailLink, createdTime)",
    orderBy: "name",
    pageSize: 1000,
  });

  const files = (res.data.files ?? []).filter(
    (f): f is { id: string; name?: string | null; thumbnailLink?: string | null; createdTime?: string | null } =>
      Boolean(f.id)
  );
  const overrides = await getPhotoOverrides(driveFolderId);

  const photos: Photo[] = files.map((file, index) => {
    const override = overrides.get(file.id);
    return {
      driveFileId: file.id,
      name: file.name ?? file.id,
      thumbnailLink: file.thumbnailLink ?? null,
      caption: override?.caption ?? null,
      sortOrder: override?.sortOrder ?? index,
      createdTime: file.createdTime ?? null,
    };
  });

  return photos.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getDriveFileStream(fileId: string) {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  const mimeType =
    (res.headers?.["content-type"] as string | undefined) ?? "application/octet-stream";

  return {
    stream: Readable.toWeb(res.data) as ReadableStream,
    mimeType,
  };
}
