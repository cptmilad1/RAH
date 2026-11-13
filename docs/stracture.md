# راهنمای ساختار پروژه RAH

این فایل نقشهٔ سریع پروژه برای توسعه‌دهندگان و دستیارهای کدنویسی بعدی است. ساختار بر اساس کد فعلی مخزن نوشته شده؛ در صورت تغییر مسیرها یا قراردادها، همین سند را به‌روزرسانی کنید.

## معرفی کوتاه

RAH یک برنامهٔ وب برای مدیریت مرسوله است: کاربر مرسوله ثبت و پیگیری می‌کند، رانندهٔ تأییدشده مرسوله‌های قابل‌پذیرش را می‌بیند و قبول می‌کند، و فرستنده/گیرنده می‌توانند از راه گفت‌وگوی مرسوله یا پیام مستقیم ارتباط داشته باشند. برنامه همچنین پروفایل، تنظیمات، حضور آنلاین، درخواست رانندگی و پنل مدیریت دارد.

پشتهٔ فعلی:

- رابط کاربری: React 19، JavaScript/JSX، Vite 8، Tailwind CSS 4
- مسیریابی: React Router 7
- وضعیت سمت کاربر: Zustand؛ هر قابلیت storeهای خودش را دارد
- فرم و اعتبارسنجی: React Hook Form و Zod
- سرور: Node.js، Express 5، CommonJS
- پایگاه داده: PostgreSQL با `pg`
- ارتباط زنده: Socket.IO
- زبان رابط: فارسی و انگلیسی با `i18next`؛ حالت پیش‌فرض فارسی و راست‌به‌چپ است

## نقشهٔ مخزن

```text
RAH/
├── BackEnd/                  # API، احراز هویت، منطق مرسوله و Socket.IO
│   ├── auth/                 # حساب کاربر، ورود، پیام مستقیم، تنظیمات و مدیریت
│   ├── Post/                 # API و منطق دامنهٔ مرسوله (نام تاریخی پوشه)
│   ├── presence/             # حضور آنلاین و ارتباط Socket.IO
│   ├── config/               # بارگذاری متغیرهای محیطی
│   ├── views/                # قالب EJS (در مسیر اصلی API استفاده نمی‌شود)
│   ├── server.js             # ورودی اصلی Express/HTTP/Socket.IO
│   ├── taxi/app.js           # فایل قدیمی/واسط؛ ورودی اجرای اصلی نیست
│   └── package.json
├── DataBase/
│   ├── base/dbBase.js        # ساخت و export کردن PostgreSQL Pool
│   ├── schema/Schema.sql    # طرح کامل پایگاه داده برای نصب تازه
│   └── migrations/           # تغییرات افزایشی برای پایگاه دادهٔ موجود
├── FrontEnd/
│   ├── src/
│   │   ├── features/         # قابلیت‌های اصلی، گروه‌بندی‌شده بر اساس دامنه
│   │   ├── global/           # اجزای عمومی رابط کاربری
│   │   ├── App.jsx           # تنظیمات سراسری و اتصال حضور
│   │   ├── main.jsx          # راه‌اندازی React و BrowserRouter
│   │   └── index.css
│   ├── public/               # دارایی‌های عمومی
│   ├── vite.config.js        # Vite و proxy به API/Socket.IO
│   └── package.json
├── docs/                     # مستندات پروژه
├── .env.example              # الگوی متغیرهای محیطی؛ مقادیر واقعی را اینجا نگذارید
├── package.json              # فرمان‌های سطح ریشه و اجرای هم‌زمان
└── README.md                 # مستند اصلی نصب و اجرای پروژه (فارسی)
```

`node_modules/`، خروجی build مانند `FrontEnd/dist/` و فایل‌های بارگذاری‌شده جزو منطق منبع برنامه نیستند؛ برای فهم معماری روی آن‌ها تکیه نکنید.

## رابط کاربری

### ورودی و مسیریابی

- `FrontEnd/src/main.jsx` برنامه را در `StrictMode`، `BrowserRouter` و CSS اصلی mount می‌کند.
- `FrontEnd/src/App.jsx` ترجمه، theme/font/color کاربر و `PresenceConnection` را در سطح برنامه هماهنگ می‌کند.
- `FrontEnd/src/features/router/routes.jsx` مسیرهای صفحه‌ها را تعریف می‌کند. صفحه‌ها عمدتاً با `lazy()` بارگذاری می‌شوند.
- `FrontEnd/src/features/router/protectedRoute.jsx` مرز دسترسی برای کاربر واردشده و نقش‌های `user`، `driver` و `admin` است.
- مسیرهای عمومی: ورود، ثبت‌نام، تأیید ایمیل و بازیابی گذرواژه.
- مسیرهای محافظت‌شده: داشبورد، پروفایل، تنظیمات، صندوق گفت‌وگوی مرسوله، پیام مستقیم، مرسوله‌ها، پنل راننده، درخواست رانندگی و پنل مدیریت.

### قابلیت‌ها در `FrontEnd/src/features/`

| پوشه | مسئولیت |
|---|---|
| `auth/` | state و API احراز هویت و اطلاعات کاربر |
| `login/` | صفحات و فرم‌های ورود، ثبت‌نام، تأیید ایمیل و بازیابی گذرواژه |
| `dashboard/` | داشبورد، ناوبری، آمار و صندوق پیام مرسوله |
| `shipments/` | فهرست، ایجاد، لغو، جزئیات و وضعیت مرسوله |
| `driver/` | درخواست رانندگی و بازار مرسوله‌های راننده |
| `messages/` | گفت‌وگوهای مستقیم کاربر با کاربر |
| `profiles/` | نمایش و ویرایش پروفایل |
| `admin/` | مدیریت کاربران و درخواست‌های رانندگی |
| `settings/` | تنظیمات ظاهر/زبان و تنظیمات حریم خصوصی/نشست |
| `presence/` | اتصال Socket.IO و state حضور آنلاین/تعداد پیام خوانده‌نشده |
| `store/` | API مشترک Axios و state مشترک کاربر |
| `layout/`, `loaders/`, `global/` | چیدمان و اجزای عمومی |

الگوی رایج داخل featureها: `api/` برای درخواست‌های HTTP، `components/` برای اجزای صفحه، `pages/` برای صفحه‌ها، `hooks/` برای رفتار/state محلی، و `schema/` یا `utils/` برای اعتبارسنجی و توابع دامنه. همهٔ featureها الزاماً همهٔ این زیرپوشه‌ها را ندارند.

### درخواست‌های HTTP و state

- `FrontEnd/src/features/store/hooks/api.js` یک Axios client با `baseURL: '/api'` و `withCredentials: true` می‌سازد.
- در پاسخ 401، یک refresh مشترک به `/auth/refresh` انجام می‌شود و درخواست اصلی یک‌بار تکرار می‌شود؛ شکست refresh رویداد `auth:session-expired` را dispatch می‌کند.
- APIهای هر قابلیت client مشترک را import می‌کنند؛ مسیرها را با `/api` دوباره prefix نکنید.
- احراز هویت با کوکی انجام می‌شود؛ access/refresh token نباید در localStorage ذخیره شوند. Zustand فقط اطلاعات پاک‌سازی‌شدهٔ کاربر را نگه می‌دارد.
- تنظیمات کاربر در localStorage cache می‌شوند و برای کاربر واردشده از API همگام می‌شوند؛ زبان/fa و en روی جهت صفحه نیز اثر می‌گذارد.

### Socket.IO

`App.jsx`، `features/presence/PresenceConnection.jsx` را فعال می‌کند. کلاینت با credentials متصل می‌شود و رویدادهای `presence:sync`، `presence:update` و `direct:unread-count` را به presence store می‌فرستد. سمت سرور در `BackEnd/server.js`، Socket.IO روی همان HTTP server نصب و از `BackEnd/presence/socketServer.js` پیکربندی می‌شود.

## سرور

### نقطهٔ ورود و middlewareهای سراسری

`BackEnd/server.js` ورودی واقعی backend است:

1. متغیرهای محیطی را بارگذاری و تنظیمات ضروری production را بررسی می‌کند.
2. HTTP server و Socket.IO را می‌سازد و presence را متصل می‌کند.
3. Helmet، CORS، parserهای JSON/form و cookie parser را نصب می‌کند.
4. `/uploads` را از پوشهٔ بارگذاری‌شده سرو می‌کند.
5. router احراز هویت/کاربران را روی `/api` و router مرسوله را روی `/api/parcels` نصب می‌کند.
6. error handler را در انتهای زنجیره قرار می‌دهد.

### `BackEnd/auth/`

- `router/router.js`: مسیرهای auth، profile، settings، session، پیام مستقیم، block، درخواست رانندگی و مدیریت.
- `controller/`: هماهنگ‌کردن HTTP با سرویس‌ها/داده‌ها برای حساب، کاربران، تنظیمات، پیام و مدیریت.
- `middleware/`: احراز هویت، نقش، مالکیت، upload تصویر، محدودسازی نرخ، اعتبارسنجی و مدیریت خطا.
- `schema/`: schemaهای Zod برای ورودی routeها.
- `repositories/`: دسترسی دادهٔ پیام مستقیم و block.
- `services/`: منطق توکن و ذخیره‌سازی تصویر و سایر عملیات قابل‌استفادهٔ مجدد.

### `BackEnd/Post/` — دامنهٔ مرسوله

- `parcelRouter.js`: همهٔ مسیرهای مرسوله را زیر `/api/parcels` تعریف می‌کند؛ کل router احراز هویت می‌خواهد و مسیرهای بازار/وضعیت راننده role-check دارند.
- `controller/`: خواندن و ساخت مرسوله، فهرست مرسوله‌ها/بازار راننده، پذیرش، لغو، گفت‌وگو و انتقال وضعیت.
- `services/parcelValidation.js`: اعتبارسنجی قواعد مرسوله.
- `repositories/`: عملیات خواندن/نوشتن مرسوله، انتقال وضعیت، صندوق ورودی، گفت‌وگو و ارتباط راننده.
- نام `Post` تاریخی است؛ منطق آن در عمل shipment/parcel است، نه یک سرویس پست جدا.

نمونهٔ endpointهای فعلی:

```text
/api/parcels
/api/parcels/:trackingCode
/api/parcels/:trackingCode/cancel
/api/parcels/driver/available
/api/parcels/driver/available/:trackingCode/accept
/api/parcels/:trackingCode/confirm-handoff
/api/parcels/:trackingCode/driver-status
/api/parcels/:trackingCode/confirm-delivery
/api/parcels/conversations
```

router احراز هویت در `BackEnd/auth/router/router.js` مسیرهای متناظر برای `/auth/*`، `/profile/*`، `/direct-messages/*`، `/settings/*`، `/driver-applications/*`، `/admin/*` و `/sessions/*` دارد.

### احراز هویت و نقش‌ها

- middleware احراز هویت access token را از کوکی می‌خواند، کاربر را در PostgreSQL بررسی می‌کند و `req.user` را می‌سازد.
- دسترسی‌ها در router با middlewareهای authentication، `authorize` و در موارد مالکیت با `ownerShip` اعمال می‌شوند.
- داده‌های فرم قبل از controller از middleware validator و schemaهای feature عبور می‌کنند.
- اگر قابلیت جدیدی به نقش خاص یا مالکیت وابسته است، کنترل دسترسی را در backend اعمال کنید؛ محافظت route در React به‌تنهایی مرز امنیتی نیست.

## پایگاه داده

- اتصال از `DataBase/base/dbBase.js` و `pg.Pool` تأمین می‌شود؛ repositoryها/کنترلرهای backend آن را import می‌کنند.
- `DataBase/schema/Schema.sql` مرجع ساخت کامل دیتابیس تازه است.
- `DataBase/migrations/` تغییرات قابل‌اجرای مرحله‌ای را نگه می‌دارد؛ migrationهای موجود به‌ترتیب تاریخ در README ریشه آمده‌اند.
- جداول اصلی در schema شامل کاربران/نقش‌ها/نشست‌ها، آدرس و مکان، پروفایل و وسیلهٔ راننده، مرسوله/تخصیص/تاریخچه/پیام، گفتگو و پیام مستقیم، اعلان‌ها، امتیازدهی، پشتیبانی و audit/system logs هستند.
- schema شامل جداول `rides` و جداول وابسته به سفر نیز هست؛ در کد backend فعلی که مرور شد، API اصلی و featureهای UI بر مرسوله متمرکزند، پس وجود جدول لزوماً به معنی پیاده‌سازی کامل قابلیت سمت برنامه نیست.
- برای تغییر طرح: schema نصب تازه و migration نصب موجود را با هم بررسی/به‌روزرسانی کنید. از تغییر دستی دیتابیس بدون migration متناظر پرهیز کنید.

## اجرا، تنظیمات و بررسی

- نصب وابستگی‌ها از ریشه: `npm install`
- اجرای هم‌زمان frontend و backend: `npm run dev`
- frontend: `FrontEnd/package.json`؛ فرمان‌های `dev`، `build`، `lint` و `preview`
- backend: `BackEnd/package.json`؛ فرمان‌های `dev`، `start` و `test` (`node --test`)
- دیتابیس محلی باید PostgreSQL باشد و schema یا migrationهای لازم پیش از استفاده اجرا شده باشند.
- `.env.example` نام متغیرهای لازم را نشان می‌دهد: JWT، آدرس frontend/app، پورت و تنظیمات PostgreSQL و SMTP. `BackEnd/config/loadEnv.js` ابتدا `BackEnd/.env` و سپس `.env` ریشه را می‌جوید.
- در production، backend تنظیمات ضروری را بررسی می‌کند؛ رازهای JWT باید بلند و از هم متفاوت باشند. هیچ‌گاه فایل `.env` واقعی را مستند یا commit نکنید.
- Vite در `FrontEnd/vite.config.js`، `/api`، `/socket.io` و `/uploads` را به backend روی `localhost:3000` proxy می‌کند.
- تست‌های موجود عمدتاً تست‌های Node در backend هستند و کنار schema/service/controller/repository مربوط قرار گرفته‌اند. lint و build رابط کاربری از package frontend اجرا می‌شوند.

## نکته‌های نگه‌داری برای دستیار بعدی

1. پیش از تغییر، route و API client و controller/schema/repository مرتبط را با هم دنبال کنید؛ قرارداد response و role guard ممکن است بین این لایه‌ها مشترک باشد.
2. قواعد وضعیت مرسوله را در پیاده‌سازی transition و repository آن بررسی کنید؛ transitionها را با update پراکنده در controller دور نزنید.
3. APIها زیر `/api` هستند و کوکی‌ها لازم‌اند؛ درخواست‌های جدید frontend باید از client مشترک استفاده کنند.
4. در تغییرات دیتابیس، migration و schema نصب تازه را هماهنگ نگه دارید.
5. مستند اصلی پروژه `README.md` ریشه است. `FrontEnd/README.md` هنوز متن عمومی قالب Vite است و مرجع معماری محصول محسوب نمی‌شود.
6. در زمان بررسی این مستند، `BackEnd/server.js` نقطهٔ ورود معتبر backend بود؛ با این حال اسکریپت `post` در `package.json` ریشه و فایل `BackEnd/taxi/app.js` به `BackEnd/Post/app.js` اشاره می‌کنند که در مخزن موجود نیست. برای اجرای سرور از اسکریپت backend (`npm run dev --prefix BackEnd`) یا اجرای ریشه (`npm run dev`) استفاده کنید، نه اسکریپت `post`.