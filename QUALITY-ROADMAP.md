# نقشه کیفیت و ممیزی انتشار (QUALITY ROADMAP)

> سند مرجع کیفیت برای مخزن Admin Panel یارسلام. این سند در حال حاضر فقط دامنه همین مخزن را پوشش می‌دهد؛ وضعیت موبایل، backend اصلی و سایر سرویس‌ها باید در ممیزی‌های مستقل ثبت شود.

## قواعد اجرایی و گزارش‌دهی

1. هیچ مرحله‌ای صرفاً به دلیل سبز بودن CI یا موفقیت Build، «آماده انتشار» تلقی نمی‌شود.
2. هر نتیجه باید به شواهد قابل تکرار متصل باشد: فرمان، محیط، commit SHA، تاریخ، خروجی یا لینک CI.
3. وضعیت‌ها فقط یکی از این مقادیر باشند: `NOT_STARTED`، `IN_PROGRESS`، `PASSED`، `FAILED`، `BLOCKED`، `NOT_APPLICABLE`.
4. تستی که اجرا نشده یا شواهد کافی ندارد، `NOT_STARTED` یا `BLOCKED` است؛ هرگز PASS فرض نمی‌شود.
5. یافته امنیتی باید شامل شناسه، بسته/فایل، نسخه، شدت، مسیر وابستگی، وضعیت اصلاح، امکان بهره‌برداری/مواجهه و تصمیم مستند باشد.
6. ابزار اسکن جایگزین بازبینی انسانی نیست. false positive، اصلاحات backport توزیع لینوکس و نبود مسیر اجرایی باید با شواهد بررسی شوند.
7. تغییرات dependency باید حداقلی و هدفمند باشند؛ lockfile باید با نصب frozen و build/test تأیید شود.
8. هیچ تست مخرب، بار سنگین، تغییر داده واقعی، deploy، تغییر DNS، یا دسترسی عمومی بدون مجوز صریح انجام نشود.
9. هر تغییر باید روی branch کاری و با PR بررسی‌پذیر باشد؛ merge و انتشار نهایی نیازمند تأیید انسانی است.
10. گزارش نهایی باید موارد پاس‌شده، شکست‌خورده، مسدود، ریسک‌های پذیرفته‌شده و کارهای باقیمانده را جدا کند.

## مراحل ممیزی

### 1. کیفیت کد — `CODE_QUALITY`
- اجرای lint و formatter check برای همه workspaceهای مرتبط.
- TypeScript type-check و بررسی خطاهای build.
- بررسی معماری ماژول‌ها، وابستگی‌های دوری، کد مرده، TODOهای امنیتی و مدیریت خطا.
- بررسی تنظیمات compiler و جلوگیری از نادیده گرفتن خطاها.
- شواهد: فرمان‌ها، نسخه ابزارها، commit و خروجی کامل.

### 2. تست واحد — `UNIT_TESTS`
- تست توابع، سرویس‌ها، guardها، interceptorها، validatorها و منطق کسب‌وکار.
- پوشش مسیرهای موفق، خطا، مرزی و ورودی نامعتبر.
- تست عدم دسترسی، نقش‌ها و رفتارهای امنیتی در سطح واحد.
- coverage گزارش شود؛ درصد پوشش به‌تنهایی معیار کیفیت نیست.

### 3. تست یکپارچگی — `INTEGRATION_TESTS`
- اتصال NestJS به MySQL و Redis و صف‌ها/workerها.
- بررسی transaction، rollback، migration/schema و رفتار هنگام قطع سرویس.
- استفاده از دیتابیس و سرویس‌های disposable؛ عدم استفاده از داده تولیدی.
- بررسی ارتباط web/server و سرویس‌های داخلی با قراردادهای واقعی.

### 4. تست API — `API_TESTS`
- قرارداد request/response، status codeها، validation و serialization.
- احراز هویت، مجوز نقش/منبع، مالکیت منابع و جلوگیری از IDOR.
- CORS، rate limit، payloadهای بزرگ/نامعتبر، خطاها و ورودی‌های مرزی.
- تست عدم افشای stack trace، secret و اطلاعات حساس.

### 5. تست End-to-End — `E2E_TESTS`
- سناریوهای واقعی ورود مدیر، خروج، انقضای نشست، دسترسی نقش‌ها و گردش‌کارهای اصلی پنل.
- تست مسیرهای موفق و شکست، refresh/retry و حالت‌های خالی/خطا.
- اجرای تست روی محیط ایزوله و نزدیک به production؛ ثبت مرورگر/نسخه و artifactها.

### 6. تست امنیتی — `SECURITY_TESTS`
- اسکن dependencyها و image با Trivy و بررسی جداگانه OS و Node/npm packages.
- بررسی Dockerfile، image base، اجرای non-root، سطح دسترسی و پورت‌های exposed.
- جست‌وجوی secrets در تاریخچه و فایل‌ها؛ بررسی تنظیمات CORS، JWT، cookie/session و headers.
- ارزیابی کنترل دسترسی، تزریق، XSS، CSRF، SSRF، IDOR و موارد مرتبط OWASP.
- ثبت false positive و backportها با منبع رسمی توزیع/تولیدکننده؛ از suppress بدون توجیه خودداری شود.
- اسکن باید روی image نهایی همان commit انجام شود و نسخه scanner/DB ثبت شود.

### 7. تست عملیاتی — `OPERATIONS_TESTS`
- اجرای Compose/image در محیط disposable و بررسی startup و health check.
- بررسی readiness/liveness، لاگ‌ها، shutdown، restart و رفتار خطا.
- پشتیبان‌گیری و بازیابی واقعی در محیط آزمایشی، نه صرفاً وجود اسکریپت backup.
- بررسی persistence، مالکیت volume، شبکه داخلی، firewall و محدودیت دسترسی.
- تأیید روش migration/bootstrap دیتابیس پیش از هر rollout تولیدی.

### 8. تست عملکرد — `PERFORMANCE_TESTS`
- اندازه‌گیری latency (p50/p95/p99)، throughput، خطا و مصرف CPU/RAM.
- بارگذاری تدریجی و آزمون پایداری با حدود محافظه‌کارانه در محیط مجاز.
- بررسی queryهای کند، N+1، connection pool، Redis و queue backlog.
- ثبت baseline و آستانه پذیرش؛ از اجرای load test روی production بدون مجوز صریح خودداری شود.

### 9. تست رابط کاربری — `UI_TESTS`
- lint/type-check/build و تست کامپوننت‌ها و تعاملات اصلی.
- RTL، فارسی، فونت، overflow، responsive layouts و اندازه‌های مختلف صفحه.
- مرورگرهای هدف، keyboard navigation، focus، contrast و دسترس‌پذیری.
- تست فرم‌ها، loading/empty/error states و پیام‌های خطا.

### 10. تست انتشار — `RELEASE_TESTS`
- CI روی commit دقیق PR سبز باشد؛ workflowهای لازم اجباری و قابل تکرار باشند.
- image نهایی با tag/digest مشخص ساخته و اسکن شود.
- تنظیمات و secrets محیط مقصد بدون نمایش مقادیر محرمانه اعتبارسنجی شوند.
- استقرار آزمایشی، smoke test، migration plan و rollback rehearsal انجام شود.
- دامنه تغییر، محدودیت‌ها، ریسک‌های پذیرفته‌شده و تأیید انسانی ثبت شود.
- «آماده انتشار» فقط وقتی اعلام شود که تمام gateهای الزامی PASS باشند و blocker باز وجود نداشته باشد.

## وضعیت فعلی — baseline در 2026-11-26

این وضعیت بر اساس شواهد موجود در روند کاری PR #50 ثبت شده و به معنی ممیزی کامل مخزن نیست.

| حوزه | وضعیت | شواهد / توضیح |
|---|---|---|
| نصب frozen lockfile | PASSED | `pnpm install --frozen-lockfile` موفق گزارش شده است |
| تست‌های هدفمند server | PASSED | 3 suite و 10 test موفق؛ auth، CORS و security config |
| build سرور | PASSED | `pnpm --filter server build` موفق |
| Docker image production | PASSED | image محلی `yarsalam-admin-backend:production` ساخته شده |
| Trivy image scan | FAILED | گزارش محلی شامل یافته‌های HIGH و CRITICAL است؛ نیازمند triage |
| web lint/type-check/build | NOT_STARTED | شواهد دقیق در این ممیزی موجود نیست |
| integration/API/E2E کامل | NOT_STARTED | فقط تست‌های هدفمند فوق تأیید شده‌اند |
| runtime smoke در CI | NOT_STARTED | باید run دقیق PR بررسی شود |
| backup/restore و rollback | NOT_STARTED | شواهد اجرایی موجود نیست |
| performance و UI accessibility | NOT_STARTED | شواهد اجرایی موجود نیست |
| release approval | BLOCKED | تا رفع/ارزیابی یافته‌های امنیتی و تکمیل gateهای الزامی ممنوع |

### نکته درباره Trivy فعلی
گزارش 49 یافته HIGH/CRITICAL از image محلی گزارش شده است. بخشی از یافته‌ها مربوط به بسته‌های Debian و بخشی مربوط به npm همراه Node.js در مسیر `/usr/local/lib/node_modules/npm/node_modules` است. تعداد یافته‌ها الزاماً برابر تعداد آسیب‌پذیری‌های مستقل نیست. نسخه Debian ممکن است اصلاحیه backport داشته باشد؛ هر مورد باید با advisory رسمی Debian و وضعیت fix در DB همان اسکن تطبیق داده شود. گزارش فعلی به‌تنهایی اثبات exploitability نیست و نباید بدون بررسی suppress شود.

## قالب ثبت اجرای هر مرحله

برای هر اجرای ممیزی، یک ردیف/گزارش با این فیلدها ثبت شود:
- تاریخ و زمان (با timezone)
- مخزن، branch و commit SHA
- مرحله و شناسه تست
- فرمان/روش اجرا و نسخه ابزار
- محیط و پیش‌نیازها (بدون secret)
- نتیجه و تعداد تست‌ها/یافته‌ها
- لینک CI یا artifact و خلاصه خروجی
- موارد شکست‌خورده/مسدود و علت
- اصلاح انجام‌شده و commit مربوط
- تأییدکننده و تصمیم نهایی

## Gate نهایی انتشار
انتشار فقط وقتی مجاز است که:
- build و type-checkهای لازم PASS باشند؛
- تست‌های واحد، یکپارچگی، API و E2E متناسب با قابلیت‌های تغییرکرده PASS باشند؛
- یافته‌های امنیتی Critical/High رفع یا با تحلیل مستند و تأیید مسئول فنی پذیرفته شده باشند؛
- image و تنظیمات runtime روی commit نهایی بررسی شده باشند؛
- smoke test، backup/restore و rollback در محیط آزمایشی شواهد داشته باشند؛
- محدودیت‌های migration و دسترسی تولیدی حل شده باشند؛
- تأیید نهایی انسانی ثبت شده باشد.

این سند زنده است: پس از هر اجرا فقط با شواهد واقعی به‌روزرسانی شود.
