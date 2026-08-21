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
  /** 앨범 제목의 첫 단어(폴더명 규칙상 도시명). 없으면 null. */
  city: string | null;
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
  latitude: number | null;
  longitude: number | null;
  cameraModel: string | null;
  aperture: number | null;
  isoSpeed: number | null;
};

export type PhotoWithAlbum = Photo & {
  albumSlug: string;
  albumTitle: string;
  albumCity: string | null;
};

export type PhotoComment = {
  id: string;
  driveFileId: string;
  authorName: string;
  body: string;
  createdAt: string;
};
