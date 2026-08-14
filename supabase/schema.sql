-- Supabase SQL 편집기에서 이 파일 전체를 실행하세요. (이미 실행한 적이 있어도
-- create table if not exists 라서 다시 실행하면 새로 추가된 부분만 반영됩니다.)
-- 사진 원본은 저장하지 않고, 트립/앨범/캡션/댓글 같은 가벼운 메타데이터만 담습니다.
-- 이 테이블들에 행을 추가하지 않아도 앱은 Google Drive 폴더/파일명만으로 기본 동작합니다.
-- (선택) 트립/앨범 제목·설명·표지, 사진 캡션/순서를 바꾸고 싶을 때만 행을 추가하세요.

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  drive_folder_id text not null unique,
  slug text unique,
  title text,
  description text,
  sort_order int,
  cover_drive_file_id text,
  created_at timestamptz not null default now()
);

create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  drive_folder_id text not null unique,
  slug text unique,
  title text,
  description text,
  sort_order int,
  cover_drive_file_id text,
  created_at timestamptz not null default now()
);

create table if not exists photo_captions (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null unique,
  album_id uuid not null references albums(id) on delete cascade,
  caption text,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists photo_comments (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists photo_comments_drive_file_id_idx
  on photo_comments (drive_file_id);

alter table trips enable row level security;
alter table albums enable row level security;
alter table photo_captions enable row level security;
alter table photo_comments enable row level security;

drop policy if exists "public read" on trips;
create policy "public read" on trips for select using (true);

drop policy if exists "public read" on albums;
create policy "public read" on albums for select using (true);

drop policy if exists "public read" on photo_captions;
create policy "public read" on photo_captions for select using (true);

drop policy if exists "public read" on photo_comments;
create policy "public read" on photo_comments for select using (true);

-- 쓰기(insert/update/delete)는 모두 service_role 키로만 수행합니다 (RLS를 우회하므로
-- 별도의 insert/update/delete 정책은 만들지 않습니다. 댓글은 /api/comments 라우트가,
-- 트립/앨범/캡션은 Supabase Studio의 테이블 편집기에서 직접 추가/수정하면 됩니다).
