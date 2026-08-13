# 신혼여행 포토북

Google Drive에 올린 사진을 앨범별로 보여주는 비밀번호 보호 웹사이트입니다.

- **사진 원본**: Google Drive (용량 걱정 없이 무제한에 가깝게 사용)
- **앨범/캡션 정보**: Supabase (무료 플랜, 텍스트만 저장)
- **웹사이트 배포**: Vercel (무료 Hobby 플랜)
- **접근 제어**: 비밀번호 하나로 전체 사이트 보호

아래 순서대로 따라 하면 됩니다. 중간에 막히는 부분이 있으면 그 화면을 캡처해서 물어보세요.

---

## 0. 전체 흐름 요약

1. Google Drive에 사진 폴더 만들기
2. Google Cloud에서 "서비스 계정" 만들어서 그 폴더에 초대(공유)하기
3. Supabase 프로젝트 만들기 (앨범 제목 등 텍스트 정보용, 선택 사항)
4. `.env.local` 파일에 위 정보 채우기 → 로컬에서 확인
5. GitHub에 코드 올리기
6. Vercel에 배포하고 같은 환경 변수 등록하기

---

## 1. Google Drive 사진 폴더 준비

1. Google Drive에서 폴더를 하나 만듭니다. 예: `신혼여행 포토북`
2. 그 안에 앨범별로 하위 폴더를 만듭니다. **폴더 이름 앞에 숫자를 붙이면 그 순서대로 화면에 표시됩니다.**
   ```
   신혼여행 포토북/
   ├── 01_인천 to 발리/
   ├── 02_우붓/
   ├── 03_스미냑/
   └── 04_귀국/
   ```
3. 각 폴더 안에 사진 파일을 올립니다. 파일 이름 순서대로 정렬되니, 순서가 중요하면 파일명 앞에 `001_`, `002_` 처럼 번호를 붙여주세요.
4. 최상위 폴더(`신혼여행 포토북`)를 열고 주소창의 URL을 확인하세요.
   ```
   https://drive.google.com/drive/folders/여기가_폴더_ID
   ```
   이 `여기가_폴더_ID` 부분을 복사해두세요. → `GOOGLE_DRIVE_ROOT_FOLDER_ID`

---

## 2. Google Cloud 서비스 계정 만들기

앱이 여러분 대신 Drive 폴더를 읽을 수 있도록 "서비스 계정"이라는 전용 로봇 계정을 만듭니다.

1. https://console.cloud.google.com/ 접속 (구글 계정으로 로그인)
2. 상단의 프로젝트 선택 드롭다운 → **새 프로젝트** → 이름은 자유롭게 (예: `honeymoon-photobook`) → 만들기
3. 만든 프로젝트를 선택한 상태에서, 검색창에 `Google Drive API` 검색 → 열기 → **사용(Enable)** 버튼 클릭
4. 왼쪽 메뉴 **API 및 서비스 → 사용자 인증 정보(Credentials)** 이동
5. 상단 **+ 사용자 인증 정보 만들기 → 서비스 계정** 클릭
6. 이름을 입력 (예: `photobook-reader`) → 만들고 계속하기 → 역할은 지정하지 않고 완료해도 됩니다
7. 생성된 서비스 계정을 클릭 → **키(Keys)** 탭 → **키 추가 → 새 키 만들기 → JSON** → 다운로드됨
8. 다운로드된 JSON 파일을 열어보면 이런 값들이 있습니다:
   ```json
   {
     "client_email": "photobook-reader@xxxx.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (따옴표 안 내용을 통째로 복사)

   ⚠️ 이 JSON 파일은 절대 GitHub에 올리지 마세요. 값만 복사해서 환경 변수로 사용합니다.

9. 다시 Google Drive로 돌아가서, 1단계에서 만든 최상위 폴더(`신혼여행 포토북`)를 **우클릭 → 공유** → `client_email` 주소를 붙여넣고 **뷰어(Viewer)** 권한으로 공유합니다. (이 단계를 빼먹으면 사진을 못 읽어옵니다!)

---

## 3. Supabase 설정 (선택 사항, 권장)

Supabase 없이도 앱은 잘 동작합니다 (앨범 제목이 폴더명 그대로 표시됨). 앨범 제목/설명이나 사진 캡션을 예쁘게 꾸미고 싶을 때만 설정하세요. 나중에 추가해도 됩니다.

1. https://supabase.com/ → GitHub 계정 등으로 가입 → **New Project**
2. 이름/비밀번호 설정 후 프로젝트 생성 (1~2분 소요)
3. 왼쪽 메뉴 **SQL Editor** → **New query** → 이 저장소의 `supabase/schema.sql` 파일 내용을 전체 복사해서 붙여넣고 **Run**
4. 왼쪽 메뉴 **Project Settings → API**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` 키(비밀 키, `anon` 키가 아님) → `SUPABASE_SERVICE_ROLE_KEY`

앨범 제목을 바꾸고 싶다면 Supabase의 **Table Editor → albums**에서 `drive_folder_id`(Drive 폴더 URL의 ID)를 채운 행을 추가하고 `title`, `description`을 원하는 대로 입력하면 됩니다.

---

## 4. 로컬에서 값 채우고 확인하기

1. 이 폴더에서 `.env.local.example` 파일을 복사해서 `.env.local` 파일을 만듭니다.
2. 위에서 모은 값들을 채워 넣습니다.
   - `SITE_PASSWORD`: 사이트 입장용 비밀번호를 원하는 대로 정하세요.
   - `SESSION_SECRET`: 터미널에서 `openssl rand -base64 32` 실행 결과를 붙여넣으세요. (Windows PowerShell이면 아무 랜덤한 긴 문자열이어도 괜찮습니다.)
3. 터미널에서 실행:
   ```bash
   npm install
   npm run dev
   ```
4. 브라우저에서 http://localhost:3000 접속 → 비밀번호 입력 → 앨범과 사진이 보이면 성공입니다.

---

## 5. GitHub에 코드 올리기

1. https://github.com/new 에서 새 저장소 생성 (Public 또는 Private, README 추가하지 않고 빈 저장소로 생성)
2. 생성된 저장소 페이지에 나오는 주소(`https://github.com/아이디/저장소이름.git`)를 복사
3. 터미널에서:
   ```bash
   git remote add origin https://github.com/아이디/저장소이름.git
   git branch -M main
   git push -u origin main
   ```

---

## 6. Vercel에 배포하기

1. https://vercel.com/ → GitHub 계정으로 로그인
2. **Add New → Project** → 방금 만든 GitHub 저장소 선택 → **Import**
3. **Environment Variables** 섹션에 `.env.local`에 있던 값들을 **하나씩 그대로** 추가합니다:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID`
   - `NEXT_PUBLIC_SUPABASE_URL` (설정했다면)
   - `SUPABASE_SERVICE_ROLE_KEY` (설정했다면)
   - `SITE_PASSWORD`
   - `SESSION_SECRET`
4. **Deploy** 클릭 → 1~2분 후 배포 완료 → 발급된 주소(`https://저장소이름.vercel.app`)로 접속해서 확인

이후에는 `git push`만 하면 Vercel이 자동으로 다시 배포해줍니다.

---

## 배포 후 확인 체크리스트

- [ ] 잘못된 비밀번호 입력 시 "비밀번호가 올바르지 않습니다" 메시지가 뜨는지
- [ ] 올바른 비밀번호 입력 후 앨범 목록이 보이는지
- [ ] 로그아웃 후 다시 `/album/아무거나` 주소로 직접 들어가면 로그인 화면으로 돌아가는지
- [ ] 앨범을 클릭하면 사진 그리드가 보이는지
- [ ] 사진을 클릭하면 원본 크기로 크게 보이는지 (좌우 화살표/ESC로 이동·닫기)

## 사진 추가하는 방법 (평소 사용법)

Google Drive의 해당 앨범 폴더에 사진을 올리기만 하면 됩니다. 사이트를 새로고침하면 바로 반영됩니다 (별도 배포/코드 수정 불필요).

## 무료 플랜 참고사항

- **Vercel Hobby**: 월 100GB 대역폭. 원본 사진 보기는 Drive에서 직접 스트리밍하므로 사진이 아주 많지 않다면 충분합니다.
- **Supabase Free**: 500MB DB. 텍스트 메타데이터만 저장하므로 사실상 한도에 걸릴 일이 없습니다.
- **Google Drive**: 개인 계정 기본 15GB(사진/문서 등 포함 전체 용량). 사진이 많다면 Google One 요금제를 고려하세요.
