-- Supabase SQL 편집기에서 이 파일 전체를 실행하세요.
-- 사진 원본은 저장하지 않고, 앨범/캡션 같은 가벼운 메타데이터만 담습니다.
-- 이 테이블에 행을 추가하지 않아도 앱은 Google Drive 폴더/파일명만으로 기본 동작합니다.
-- (선택) 앨범 제목/설명/표지, 사진 캡션/순서를 바꾸고 싶을 때만 행을 추가하세요.

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

alter table albums enable row level security;
alter table photo_captions enable row level security;

drop policy if exists "public read" on albums;
create policy "public read" on albums for select using (true);

drop policy if exists "public read" on photo_captions;
create policy "public read" on photo_captions for select using (true);

-- 쓰기(insert/update/delete)는 service_role 키로만 수행합니다 (RLS를 우회하므로
-- 별도의 insert/update/delete 정책은 만들지 않습니다. Supabase Studio의
-- 테이블 편집기에서 직접 행을 추가/수정해도 됩니다).
