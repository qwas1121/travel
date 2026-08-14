export type Trip = {
  slug: string;
  driveFolderId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  coverDriveFileId: string | null;
};

export type Album = {
  slug: string;
  driveFolderId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  coverDriveFileId: string | null;
};

export type Photo = {
  driveFileId: string;
  name: string;
  thumbnailLink: string | null;
  caption: string | null;
  sortOrder: number;
  createdTime: string | null;
  /** EXIF 촬영 시각(있으면) 또는 업로드 시각. "YYYY:MM:DD HH:MM:SS" 또는 ISO 문자열. */
  takenAt: string | null;
};

export type PhotoWithAlbum = Photo & {
  albumSlug: string;
  albumTitle: string;
};

export type PhotoComment = {
  id: string;
  driveFileId: string;
  authorName: string;
  body: string;
  createdAt: string;
};
