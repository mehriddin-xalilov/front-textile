/** Sayt interfeysi tarjimalari (uz asosiy). Kontent (mahsulot, banner, sahifa) API dan ?lang bilan keladi. */
export type Lang = 'uz' | 'ru' | 'en';
export const LANGS: { code: Lang; label: string }[] = [{ code: 'uz', label: "O'zbek" }, { code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }];

const dict: Record<string, [string, string]> = {
  // uz kalit: [ru, en]
  'Katalog': ['Каталог', 'Catalog'], 'Konstruktor': ['Конструктор', 'Designer'], 'Buyurtmalarim': ['Мои заказы', 'My orders'], 'Kirish': ['Войти', 'Sign in'],
  "O'z logotipingizni bosing": ['Ваш логотип на одежде', 'Your logo on apparel'], 'Profil': ['Профиль', 'Profile'], 'Chiqish': ['Выйти', 'Log out'],
  'Tayyor dizaynlar': ['Готовые дизайны', 'Ready designs'], "Bir bosishda konstruktorda ochiladi — o'zgartiring yoki shundayligicha buyurtma bering.": ['Открывается в конструкторе одним кликом — измените или закажите как есть.', 'Opens in the designer in one click — edit it or order as is.'],
  'Kiyimlar': ['Одежда', 'Apparel'], 'Tayyor mahsulotlar': ['Готовые товары', 'Finished products'], 'Barchasi': ['Все', 'All'], "Mahsulot yo'q": ['Нет товаров', 'No products'],
  'Rang': ['Цвет', 'Color'], 'Razmerlar (omborda)': ['Размеры (в наличии)', 'Sizes (in stock)'], 'Dizayn qilish va buyurtma berish': ['Создать дизайн и заказать', 'Design & order'],
  'Mato': ['Ткань', 'Fabric'], '+ logo/yozuv bosish': ['+ печать логотипа/надписи', '+ logo/text print'], 'Old': ['Перед', 'Front'], 'Orqa': ['Спина', 'Back'], 'Chap': ['Лево', 'Left'], "O'ng": ['Право', 'Right'],
  'Yuklanmoqda...': ['Загрузка...', 'Loading...'], "Hali buyurtma yo'q.": ['Заказов пока нет.', 'No orders yet.'], 'Dizayn qiling': ['Создайте дизайн', 'Create a design'], 'pozitsiya': ['позиций', 'items'],
  'Buyurtmani bekor qilish': ['Отменить заказ', 'Cancel order'], 'dona': ['шт', 'pcs'],
  'Yangi': ['Новый', 'New'], 'Tasdiqlandi': ['Подтверждён', 'Confirmed'], 'Bosilmoqda': ['Печать', 'Printing'], 'Tikilmoqda': ['Пошив', 'Sewing'], 'Tayyor': ['Готов', 'Ready'], "Jo'natildi": ['Отправлен', 'Shipped'], 'Yetkazildi': ['Доставлен', 'Delivered'], 'Bekor qilindi': ['Отменён', 'Cancelled'],
  "Buyurtmalarni ko'rish uchun": ['Чтобы увидеть заказы,', 'To see your orders,'], 'kiring': ['войдите', 'sign in'],
  "To'lov qabul qilindi": ['Оплата принята', 'Payment received'], "To'lov tekshirilmoqda...": ['Проверяем оплату...', 'Checking payment...'], "Buyurtmani ko'rish": ['Открыть заказ', 'View order'],
  "To'lov tasdig'i bir necha soniyada keladi. Sahifani yopmang.": ['Подтверждение придёт через несколько секунд. Не закрывайте страницу.', 'Confirmation arrives in a few seconds. Keep the page open.'],
  'Mijozlarga': ['Клиентам', 'Customers'], 'Aloqa': ['Контакты', 'Contact'], 'Sahifalar': ['Страницы', 'Pages'], 'Barcha huquqlar himoyalangan.': ['Все права защищены.', 'All rights reserved.'],
  'Logosiz kiyimlar': ['Одежда без логотипа', 'Blank apparel'], '3D konstruktor': ['3D конструктор', '3D designer'],
  "Konstruktorga kirish uchun avval ro'yxatdan o'ting yoki kiring.": ['Чтобы открыть конструктор, войдите или зарегистрируйтесь.', 'Sign in or register to open the designer.'],
  'Kirish / Ro\'yxatdan o\'tish': ['Войти / Регистрация', 'Sign in / Register'], 'Bosh sahifaga': ['На главную', 'Home'],
  'Tanlang va darhol buyurtma bering — dizayn tayyor.': ['Выберите и закажите сразу — дизайн готов.', 'Pick one and order right away — the design is ready.'], "3D konstruktorda o'z dizayningizni yarating": ['Создайте свой дизайн в 3D-конструкторе', 'Create your own design in the 3D designer'],
  'Yetkazib berish': ['Доставка', 'Delivery'], "O'zbekiston bo'ylab": ['По Узбекистану', 'Across Uzbekistan'], 'Sifat kafolati': ['Гарантия качества', 'Quality guarantee'],
  'Sharhlar': ['Отзывы', 'Reviews'], 'Bahoyingiz': ['Ваша оценка', 'Your rating'], 'Mahsulot haqida fikringiz': ['Ваш отзыв о товаре', 'Your thoughts on the product'], 'Yuborish': ['Отправить', 'Send'], 'Kirish va sharh qoldirish': ['Войти и оставить отзыв', 'Sign in to review'], 'Hali sharh yo‘q. Birinchi bo‘ling!': ['Отзывов пока нет. Будьте первым!', 'No reviews yet. Be the first!'], 'Sharhingiz qabul qilindi — tekshiruvdan keyin chiqadi.': ['Отзыв принят — появится после проверки.', 'Review received — it will appear after moderation.'], 'Xatolik': ['Ошибка', 'Error'],
  'Sichqoncha bilan aylantiring': ['Вращайте мышью', 'Drag to rotate'],
  'ta sharh': ['отзывов', 'reviews'],
  'Savat': ['Корзина', 'Cart'], "Savat bo'sh": ['Корзина пуста', 'Your cart is empty'], 'Sevimlilar': ['Избранное', 'Favourites'], "Sevimlilar ro'yxati bo'sh": ['В избранном пусто', 'No favourites yet'], 'Buyurtma berish': ['Оформить заказ', 'Place order'], 'Savatga': ['В корзину', 'Add to cart'], "Savatga qo'shish": ['Добавить в корзину', 'Add to cart'],
  "Savatga qo'shildi": ['Добавлено в корзину', 'Added to cart'],
  'Bir donadan buyurtma': ['Заказ от одной штуки', 'Order from one piece'], "Minimal miqdor yo'q": ['Без минимального заказа', 'No minimum order'], "O'zbekiston bo'ylab 2-3 kunda": ['По Узбекистану за 2-3 дня', 'Across Uzbekistan in 2-3 days'], "100% paxta, bosma yuvishda o'chmaydi": ['100% хлопок, принт не смывается', '100% cotton, print survives washing'],
  'Til': ['Язык', 'Language'],
  'Ulashish': ['Поделиться', 'Share'], 'Xususiyatlari': ['Характеристики', 'Specifications'], 'marta sotilgan': ['раз куплено', 'sold'], 'Hozir sotib olish': ['Купить сейчас', 'Buy now'],
  'ta mahsulot savatda': ['товара в корзине', 'items in cart'], 'Savatni tozalash': ['Очистить корзину', 'Clear cart'], 'Buyurtmangiz': ['Ваш заказ', 'Your order'], 'Mahsulotlar': ['Товары', 'Products'], 'Bepul': ['Бесплатно', 'Free'], 'Umumiy narx': ['Итого', 'Total'], 'Davom etish': ['Продолжить', 'Continue'], 'Xaridor himoyasi': ['Защита покупателя', 'Buyer protection'], '100% pulni qaytarish kafolati': ['Гарантия возврата 100%', '100% money-back guarantee'], "Xavfsiz to'lov": ['Безопасная оплата', 'Secure payment'], 'Tezkor yetkazib berish': ['Быстрая доставка', 'Fast delivery'], '1-3 ish kuni': ['1-3 рабочих дня', '1-3 business days'], 'Oson qaytarish': ['Лёгкий возврат', 'Easy returns'], '14 kun ichida': ['В течение 14 дней', 'Within 14 days'],
  'Oldingi': ['Назад', 'Previous'], 'Keyingi': ['Вперёд', 'Next'],
  'rasm': ['фото', 'photos'],
  'Yopish': ['Закрыть', 'Close'],
  'Manzillarim': ['Мои адреса', 'My addresses'], "Ma'lumotlarim": ['Мои данные', 'My details'], 'Shaxsiy kabinet uchun tizimga kiring': ['Войдите в личный кабинет', 'Sign in to your account'], 'Yangi manzil': ['Новый адрес', 'New address'], 'Manzil nomi (Uy, Ish)': ['Название (Дом, Работа)', 'Label (Home, Work)'], 'Qabul qiluvchi': ['Получатель', 'Recipient'], 'Viloyat': ['Область', 'Region'], 'Shahar / tuman': ['Город / район', 'City / district'], "Ko'cha, uy": ['Улица, дом', 'Street, house'], 'Kvartira': ['Квартира', 'Apartment'], "Mo'ljal": ['Ориентир', 'Landmark'], 'Asosiy manzil': ['Основной адрес', 'Default address'], 'Asosiy': ['Основной', 'Default'], 'Saqlash': ['Сохранить', 'Save'], 'Bekor qilish': ['Отмена', 'Cancel'], 'Tahrirlash': ['Изменить', 'Edit'], "Manzil yo'q": ['Адресов пока нет', 'No addresses yet'], 'Ism': ['Имя', 'First name'], 'Familiya': ['Фамилия', 'Last name'], 'Telefon': ['Телефон', 'Phone'], 'Manzilni tanlang': ['Выберите адрес', 'Choose an address'], 'Yangi manzil kiritish': ['Ввести новый адрес', 'Enter a new address'], 'Buyurtma tarkibi': ['Состав заказа', 'Order items'],
  'Manzil': ['Адрес', 'Address'],
  "Kirish yoki ro'yxatdan o'tish": ['Вход или регистрация', 'Sign in or sign up'], "Telefon raqamingizni kiriting — keyingi qadamni o'zimiz tanlaymiz.": ['Введите номер телефона — дальше мы всё подскажем.', 'Enter your phone number and we will take it from there.'], 'Davom etish orqali siz ommaviy oferta shartlariga rozilik bildirasiz.': ['Продолжая, вы соглашаетесь с условиями публичной оферты.', 'By continuing you accept the public offer terms.'], 'Parolni kiriting': ['Введите пароль', 'Enter your password'], "Parol o'ylab toping": ['Придумайте пароль', 'Create a password'], 'Parol': ['Пароль', 'Password'], 'Kamida 6 ta belgi': ['Минимум 6 символов', 'At least 6 characters'], "Parolni ko'rsatish": ['Показать пароль', 'Show password'], 'Orqaga': ['Назад', 'Back'],
  'Sotib olish': ['Купить', 'Buy now'], 'Kirish va sotib olish': ['Войти и купить', 'Sign in & buy'], "O'zgartirish": ['Изменить', 'Customize'], 'Soni': ['Кол-во', 'Qty'], 'Jami': ['Итого', 'Total'], "To'lov": ['Оплата', 'Payment'], 'Ismingiz': ['Ваше имя', 'Your name'], 'Telefon (+998...)': ['Телефон (+998...)', 'Phone (+998...)'], 'Yetkazib berish manzili': ['Адрес доставки', 'Delivery address'], 'Razmer': ['Размер', 'Size'], 'Razmer tanlang': ['Выберите размер', 'Choose a size'], 'bosma bilan': ['с печатью', 'with print'], "3D ko'rinish": ['3D вид', '3D view'],
  'Saqlash (admin)': ['Сохранить (админ)', 'Save (admin)'], 'Saqlandi': ['Сохранено', 'Saved'],
};

export const getLang = (): Lang => (localStorage.getItem('tx_lang') as Lang) || 'uz';
export const setLang = (l: Lang) => localStorage.setItem('tx_lang', l);
export const t = (key: string): string => {
  const l = getLang();
  if (l === 'uz') return key;
  const row = dict[key];
  return row ? (l === 'ru' ? row[0] : row[1]) || key : key;
};
