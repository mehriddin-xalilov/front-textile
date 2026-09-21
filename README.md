# Textile — mijoz sayti + 3D konstruktor (web-3d)

Asos: [jericNuez/shirt-designer](https://github.com/jericNuez/shirt-designer) (MIT) — React + Three.js/R3F, 360° 3D futbolka, ko'p zonali dizayn, 300 DPI PSD/PNG eksport.
Asl imkoniyatlar to'liq saqlangan (shriftlar, matn shablonlari, shakllar, vektor stamplar, palitra, yoritish, wireframe, undo/redo, mobil).
Ustiga Textile API ulangan.

```bash
npm install
npm run dev          # http://localhost:5174 (vite.config port 3000 → --port bilan)
# .env.local: VITE_API_ROOT=http://127.0.0.1:8200/api/v1
```

Ochish: `/?product=classic-tshirt` (slug bo'lmasa birinchi mahsulot).

## Sahifalar (react-router)
| Yo'l | Nima |
|---|---|
| `/` | Bosh sahifa: hero (3D embed), kategoriya filtri, mahsulotlar |
| `/product/:slug` | Mahsulot: mockup rasmlar (old/orqa/yon) yoki 3D, ranglar, razmer qoldiqlari, "Dizayn qilish" |
| `/studio?product=slug` | Konstruktor (asl shirt-designer + Textile) |
| `/orders`, `/orders/:id` | Buyurtmalarim, holat yo'li, bekor qilish (faqat "new") |
| `/profile` | Profil, chiqish |
| `/studio?embed=view` | Admin uchun 3D ko'rish (postMessage) |
| `/studio?design=ID#token=...` | Admin tahrirlash rejimi (admin tokeni), "Saqlash (admin)" → `PUT /admin/designs/{id}` |
| `/page/:slug` | Statik sahifa (CMS) |
| `/tools/thumbs?auto=1` | 3D thumbnail va shablon preview generatori (admin) |
| `/tools/thumbs?auto=1&only=photos` | Faqat do'kon fotolarini qayta yaratish (3D render qilmay, tez) |

Til: header'da tanlanadi (`tx_lang`), UI matnlari `src/i18n.ts`, kontent API `Accept-Language`. Konstruktor kirmagan foydalanuvchiga yopiq (embed va admin rejimidan tashqari).

Mobil (Flutter): katalog/buyurtma nativ, konstruktor `webview_flutter` bilan `/studio?product=...` (WebGL iOS/Android WebView'da ishlaydi; token localStorage `tx_token` orqali beriladi).

## Qo'shilgan (Textile)

| Fayl | Nima |
|---|---|
| `src/services/api.ts` | API mijozi: fonts, cliparts, phrases, products, auth, files, designs, orders |
| `src/store/shopStore.ts` | mahsulot / rang / variant / foydalanuvchi; rang → `editorStore.colors.body` |
| `components/shop/AuthModal.tsx` | telefon + parol kirish / ro'yxat |
| `components/shop/OrderModal.tsx` | 3D snapshot → preview, har zona 300 DPI PNG → print_files, data:URL rasmlar → /files, `POST /designs` (canvas v2), `POST /orders` |
| `tabs/GarmentColorTab.tsx` | mahsulot tanlash + mahsulot ranglari (omborga bog'liq) + asl erkin palitra (ko'rish uchun) |
| `tabs/TextEditorTab.tsx` | shriftlar = asl 13 + API; shablonlar = trend so'zlar (API) + asl 4 |
| `tabs/ClipartTab.tsx` | "Tayyor logolar" bo'limi (API, bir rangli → rang tanlanadi) + asl shakllar/stamplar |
| `Navbar.tsx` | Kirish / foydalanuvchi, Yuklab olish (asl Export), Buyurtma |

Canvas v2 (`engine: shirt-designer-3d`): asl `ProjectData` (colors + layers) + `print_files{zone: file_id}`. Backend tekshiradi (`DesignCanvas::rulesV2`), admin `summary` va bosma fayllarni ko'rsatadi.

## Embed (admin uchun)
`/?embed=view&product=<slug>` — faqat 3D sahna. Ota oyna `postMessage({type:'tx:load', product, canvas})` yuboradi (iframe `tx:ready` deganda). Admin `components/design-3d` shu bilan buyurtma va dizayn sahifalarida xuddi konstruktordagi 3D ko'rinishni beradi (`VITE_DESIGNER_URL`).

## 3D modellar
Model mahsulotdan keladi: `product.garment_model.url` (admin → 3D modellar, storage CORS bilan) + `zones` (decal position/rotation/scale har tomon uchun). Model yo'q bo'lsa `public/models/shirt_model.glb`.
Yangi kiyim turi: adminda GLB yuklash → zonalarni JSON bilan sozlash → mahsulotga bog'lash. Kod o'zgarmaydi.
Zona JSON (admin → 3D modellar → zones):
`{"front":{"rel":[dx,dy,dz?],"scale":0.3 | [eni,bo'yi,chuqurlik],"side":"front|back|left|right"}}`
- `rel` — markazdan bbox ulushida siljish (shim: `[-0.2,0.22]` chap son; kepka: `[0,0.06,0.2]` gumbaz oldi)
- `scale` — bitta son (bir xil) yoki uch son; uchinchisi decal qutisining **chuqurligi**: qaysi yuzaga tushishini belgilaydi (kepkada kozirokka tushmasligi uchun)
- yoki aniq `position/rotation/scale` (model birliklarida)
Sozlashda brauzer konsolida `window.__tx_debug` — `bbox` (min/max/size/center) va hisoblangan `Z` zonalari.

## Modellar (admin → 3D modellar)
| Model | Manba | Litsenziya | Hajm (siqilgan) |
|---|---|---|---|
| Futbolka (standart) | shirt-designer | MIT | 1.0 MB |
| Polo | chokybali, Sketchfab | CC-BY 4.0 | 0.98 MB |
| Uzun yengli | chokybali, Sketchfab | CC-BY 4.0 | 2.4 MB |
| Xudi | ShoyoX, Sketchfab | CC-BY 4.0 | 0.5 MB |
| Triko (shim) | maxx_renn, Sketchfab | CC-BY 4.0 | 0.7 MB |

CC-BY: saytda "3D modellar: chokybali, ShoyoX, maxx_renn (Sketchfab)" degan yozuv bo'lishi shart.

Yangi GLB tayyorlash (Sketchfab 10–40 MB → 0.5–2.5 MB):
```bash
npx @gltf-transform/cli@4 optimize in.glb out.glb --compress draco --texture-compress webp --texture-size 1024 --simplify true --simplify-ratio 0.5
```
`TShirtModel.tsx` har qanday GLB'ni qabul qiladi: barcha meshlar birlashtiriladi (CLO3D bo'laklari), bbox bo'yicha normallashtiriladi, rang teksturasi o'chiriladi (mato rangi bizniki), decal zonalari bbox'dan avtomatik (adminda `zones` bilan aniqlashtirish mumkin). Draco dekoder gstatic CDN'dan (drei default) — internet kerak.

## Keyingi
- Mayka (yengsiz) modeli; zonalarni har model uchun qo'lda aniqlashtirish (yeng joylari)
- Konstruktor ichida mahsulot bosma joylari (`print_areas`) bilan zona chegaralarini moslashtirish (hozir asl 12"×16")
- Undo/redo, mobil — asl loyihada bor, ishlaydi


## Do'kon fotosi (tayyor mahsulotlar kartochkasi)

Tayyor mahsulotlar (`/ready`, `/design/:id`) 3D render emas, **haqiqiy studiya fotosi** asosidagi
maket bilan ko'rsatiladi — `src/utils/photoMockup.ts`.

Plastinkalar `public/mockups/` da (Pexels, bepul litsenziya — osilgan futbolka fotosidan olingan):

| Fayl | Nima |
|------|------|
| `tshirt-base.png` | kulrang kiyim + alpha (shakl niqobi) |
| `tshirt-shade.png` | burma/soyalar — `multiply` |
| `tshirt-hi.png` | yorug' joylar — additive (qora matoda burma ko'rinsin) |

Rang: `color × shade + hi`, keyin niqobga qirqiladi. Bosma ko'krak to'rtburchagiga
(`PLATE_INFO.<plate>.print`) "contain" qilib joylanadi va soyalar bilan ko'paytiriladi.
Chiqish nisbati 4:5 (`RATIO`), kiyim kadrning 94% ini egallaydi (`FILL`).

Yangi kiyim turi uchun: fotodan plastinkalarni tayyorlang (saturatsiya bo'yicha niqob),
`PLATE_INFO` ga `garment` (kiyim bbox) va `print` to'rtburchagini qo'shing,
`ThumbsTool.PHOTO_PLATES` ga mahsulot slug'ini bog'lang. Plastinkasi yo'q mahsulotlar 3D renderda qoladi.
