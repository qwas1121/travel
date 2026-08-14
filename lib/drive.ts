import { google } from "googleapis";
import { Readable } from "node:stream";
import type { Album, Photo, PhotoWithAlbum, Trip } from "./types";
import {
  getAlbumOverrides,
  getPhotoOverrides,
  getTripOverrides,
  type FolderOverride,
} from "./supabase";

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
  return slug || "item";
}

type FolderEntity = {
  slug: string;
  driveFolderId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  coverDriveFileId: string | null;
};

/** 특정 폴더 바로 아래의 서브폴더들을 (트립/앨범 공용) 엔티티 목록으로 나열합니다. */
async function listChildFolders(
  parentFolderId: string,
  overrides: Map<string, FolderOverride>
): Promise<FolderEntity[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 200,
  });

  const folders = (res.data.files ?? []).filter(
    (f): f is { id: string; name: string } => Boolean(f.id && f.name)
  );

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
  return draft
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
}

async function getFirstImageThumbnail(
  folderId: string
): Promise<string | null> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(thumbnailLink)",
    orderBy: "name",
    pageSize: 1,
  });
  return res.data.files?.[0]?.thumbnailLink ?? null;
}

export async function listTrips(): Promise<Trip[]> {
  const overrides = await getTripOverrides();
  return listChildFolders(getRootFolderId(), overrides);
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const trips = await listTrips();
  return trips.find((t) => t.slug === slug) ?? null;
}

export async function getTripCoverThumbnail(
  trip: Pick<Trip, "driveFolderId" | "coverDriveFileId">
): Promise<string | null> {
  const drive = getDriveClient();

  if (trip.coverDriveFileId) {
    const res = await drive.files.get({
      fileId: trip.coverDriveFileId,
      fields: "thumbnailLink",
    });
    if (res.data.thumbnailLink) return res.data.thumbnailLink;
  }

  const albums = await listAlbums(trip.driveFolderId);
  for (const album of albums) {
    const cover = await getAlbumCoverThumbnail(album);
    if (cover) return cover;
  }
  return null;
}

export async function listAlbums(tripFolderId: string): Promise<Album[]> {
  const overrides = await getAlbumOverrides();
  return listChildFolders(tripFolderId, overrides);
}

export async function getAlbumBySlug(
  tripFolderId: string,
  slug: string
): Promise<Album | null> {
  const albums = await listAlbums(tripFolderId);
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

  return getFirstImageThumbnail(album.driveFolderId);
}

export async function listPhotos(driveFolderId: string): Promise<Photo[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${driveFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields:
      "files(id, name, thumbnailLink, createdTime, imageMediaMetadata(time))",
    orderBy: "name",
    pageSize: 1000,
  });

  const files = (res.data.files ?? []).filter(
    (f): f is typeof f & { id: string } => Boolean(f.id)
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
      takenAt: file.imageMediaMetadata?.time ?? file.createdTime ?? null,
    };
  });

  return photos.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 트립 안 모든 앨범의 사진을 한데 모읍니다 (날짜별 보기용). */
export async function listAllPhotos(
  tripFolderId: string
): Promise<PhotoWithAlbum[]> {
  const albums = await listAlbums(tripFolderId);
  const perAlbum = await Promise.all(
    albums.map(async (album) => {
      const photos = await listPhotos(album.driveFolderId);
      return photos.map((photo) => ({
        ...photo,
        albumSlug: album.slug,
        albumTitle: album.title,
      }));
    })
  );
  return perAlbum.flat();
}

/** 사진의 촬영 날짜에서 "YYYY-MM-DD" 형태의 그룹핑 키를 뽑아냅니다. */
export function photoDateKey(photo: Photo): string | null {
  const value = photo.takenAt;
  if (!value) return null;

  const exifMatch = value.match(/^(\d{4}):(\d{2}):(\d{2})/);
  if (exifMatch) return `${exifMatch[1]}-${exifMatch[2]}-${exifMatch[3]}`;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  return null;
}

export function formatDateKeyKorean(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

/** 사진들의 촬영일 범위로부터 "n박 n+1일" 여행 기간을 계산합니다. 날짜 정보가 없으면 null. */
export function getTripDuration(photos: Photo[]): string | null {
  const keys = photos
    .map(photoDateKey)
    .filter((key): key is string => Boolean(key))
    .sort();
  if (keys.length === 0) return null;

  const first = new Date(`${keys[0]}T00:00:00`);
  const last = new Date(`${keys[keys.length - 1]}T00:00:00`);
  const nights = Math.round(
    (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) return "당일치기";
  return `${nights}박 ${nights + 1}일`;
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
