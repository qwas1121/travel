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
};
