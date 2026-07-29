/**
 * Apps Script backend для форми "Обговорити проєкт" / "Написати" на сайті-портфоліо.
 * Записує заявки (Ім'я, Телефон, Текст) у Google Таблицю і дублює сповіщення в Telegram.
 *
 * ==================== НАЛАШТУВАННЯ ====================
 * 1. Відкрийте вашу Google Таблицю (ту, що вже є) → меню "Розширення" → "Apps Script".
 * 2. Видаліть увесь вміст файлу Code.gs, який відкриється, і вставте туди весь цей файл.
 * 3. Нижче заповніть TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID своїми значеннями
 *    (як отримати — дивіться README.md в архіві сайту).
 * 4. За потреби змініть SHEET_NAME на назву аркуша (вкладки) в таблиці, куди писати заявки.
 *    Якщо такого аркуша ще немає — скрипт створить його сам і додасть заголовки колонок.
 * 5. Збережіть файл (значок дискети або Ctrl+S).
 * 6. Натисніть "Deploy" → "New deployment" → оберіть тип "Web app":
 *      - Execute as: Me (ваш акаунт)
 *      - Who has access: Anyone
 *    Натисніть "Deploy", підтвердьте дозволи Google (це ваш власний скрипт, це безпечно).
 * 7. Скопіюйте URL веб-застосунку (він закінчується на /exec).
 * 8. Вставте цей URL в index.html сайту — знайдіть рядок:
 *      const APPS_SCRIPT_URL = 'ВСТАВТЕ_СЮДИ_URL_WEB_APP';
 *    і замініть плейсхолдер на скопійований URL.
 * 9. Якщо пізніше зміните код цього файлу — робіть "New deployment" знову
 *    (просте збереження файлу не оновлює вже опубліковану версію).
 * ========================================================
 */

var TELEGRAM_BOT_TOKEN = '8931954355:AAFQliOcCDqgbzuI7JEpeHoBAcSh5GfxJzM';
var TELEGRAM_CHAT_ID   = '202482053';

const SHEET_NAME = 'Заявки'; // назва аркуша (вкладки) в таблиці

function doPost(e) {
  try {
    const params = e.parameter;
    const name = (params.name || '').trim();
    const phone = (params.phone || '').trim();
    const message = (params.message || '').trim();
    const source = params.source || 'Заявка з портфоліо';
    const timestamp = new Date();

    // Запис у Google Таблицю
    const sheet = getOrCreateSheet();
    sheet.appendRow([timestamp, name, phone, message, source]);

    // Дублювання сповіщення в Telegram (якщо токен заповнено)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN.indexOf('ВСТАВТЕ') === -1) {
      sendToTelegram(name, phone, message, source);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Дата', "Ім'я", 'Телефон', 'Текст', 'Джерело']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendToTelegram(name, phone, message, source) {
  const text =
    source + '\n' +
    "Ім'я: " + name + '\n' +
    'Телефон: ' + phone + '\n' +
    'Повідомлення: ' + (message || '—');

  const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: {
      chat_id: TELEGRAM_CHAT_ID,
      text: text
    },
    muteHttpExceptions: true
  });
}
