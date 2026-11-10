# Yarsalam Admin Panel

پنل مدیریت یارسلام یک monorepo مبتنی بر Turborepo است:

- `apps/web`: رابط مدیریتی Next.js و React، با پشتیبانی RTL فارسی.
- `apps/server`: API پنل مدیریت با NestJS؛ شامل احراز هویت مدیران و proxy به API داخلی بک‌اند یارسلام.
- `docker-compose.yml`: محیط توسعه شامل وب، سرور ادمین، MySQL و Redis.

## راه‌اندازی محلی با Docker

پیش‌نیازها: Docker و Docker Compose.

اگر شبکهٔ مشترک بک‌اند وجود ندارد، ابتدا آن را بساز و مطمئن شو سرویس بک‌اند `backend` روی شبکهٔ `yarsalam_network` در حال اجراست:\n\n   `docker network create yarsalam_network`\n\n1. فایل نمونهٔ محیط را کپی کن:

   ```bash
   cp .env.example .env
   ```

2. مقادیر نمونه را در `.env` با مقادیر اختصاصی خودت جایگزین کن. حداقل این موارد باید درست باشند:
   - `ADMIN_DB_ROOT_PASSWORD` و `ADMIN_DB_PASSWORD`: دو رمز منحصربه‌فرد؛ برنامه با کاربر محدود `ADMIN_DB_USER` متصل می‌شود و از حساب root استفاده نمی‌کند.
   - `JWT_SECRET`: کلید تصادفی و طولانی برای امضای JWT؛ می‌توانی با `openssl rand -base64 48` تولیدش کنی.
   - `USER_API_KEY`: باید دقیقاً با `INTERNAL_API_KEY` در بک‌اند `yarsalam/mobApp` یکسان باشد.
   - `INITIAL_ADMIN_EMAIL` و `INITIAL_ADMIN_PASSWORD`: حساب اولیهٔ مدیر ارشد. رمز باید حداقل ۱۶ کاراکتر و غیرقابل حدس باشد.

3. سرویس‌ها را اجرا کن:

   ```bash
   docker compose up --build
   ```

4. آدرس‌های محلی:
   - وب: http://localhost:3000
   - API پنل مدیریت: http://localhost:4000

پس از ایجاد حساب اولیه، مقدار `INITIAL_ADMIN_PASSWORD` را از محیط اجرا حذف کن. برای نصب‌های قدیمی که از رمزهای پیش‌فرض نسخه‌های قبلی استفاده کرده‌اند، حساب‌های قبلی را بررسی و رمزهای آن‌ها را عوض یا غیرفعال کن؛ تغییر seeder به‌صورت خودکار حساب‌های قدیمی را حذف نمی‌کند.

## اجرای بررسی‌های کد

در ریشهٔ پروژه:

```bash
pnpm install
pnpm --filter web check-types
pnpm --filter web build
pnpm --filter server build
```

برای اجرای lint و تست‌های سرور:

```bash
pnpm --filter server lint
pnpm --filter server test
```

## پیکربندی مهم

- `NEXT_PUBLIC_API_URL`: آدرس API سرور ادمین که مرورگر به آن متصل می‌شود.
- `ADMIN_WEB_ORIGINS`: فهرست originهای مجاز وب، جداشده با کاما.
- `USER_API_BASE_URL`: آدرس بک‌اند کاربران از دید کانتینر سرور ادمین. در Compose پیش‌فرض `http://backend:5000` است.
- `DB_SYNC`: در توسعه می‌تواند `true` باشد. در محیط production همگام‌سازی خودکار schema به‌اجبار غیرفعال است؛ برای تغییر schema در production از migration استفاده کن.
- فایل واقعی `.env` را commit نکن. فقط `.env.example` باید در Git نگهداری شود.

## وضعیت تطبیق API

داشبورد اجرایی با شکل پاسخ واقعی `/exec/dashboard` هماهنگ شده است. بعضی تحلیل‌های پیشرفتهٔ درآمد (از جمله درآمد به تفکیک محصول/جنسیت، cohort، قیف درآمد، churn، تمرکز درآمد و دقت پیش‌بینی) در API فعلی بک‌اند موبایل وجود ندارند؛ رابط کاربری تا پیاده‌سازی endpointهای واقعی، درخواست‌های آن‌ها را ارسال نمی‌کند و اعداد ساختگی نمایش نمی‌دهد.

## معماری احراز هویت

- وب توکن مدیر را با کلید `admin-token` نگه می‌دارد و آن را به‌صورت Bearer token می‌فرستد.
- سرور ادمین JWT را اعتبارسنجی می‌کند؛ `JWT_SECRET` باید بین اجرای سرور ثابت و محرمانه باشد.
- ارتباط سرور ادمین با بک‌اند کاربران با هدر `x-api-key` و مقدار `USER_API_KEY` انجام می‌شود.
- پاسخ `401` باعث پاک شدن نشست محلی و هدایت کاربر به صفحهٔ ورود می‌شود.
