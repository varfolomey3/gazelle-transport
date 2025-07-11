<?php
// Конфигурация бота
$botToken = '8150678104:AAHbqokHXMN3XLllSdMt9-LIGZ0E06vBrV4'; // Ваш токен бота
$adminChatId = '1264513616';

// Получаем данные запроса
$update = json_decode(file_get_contents('php://input'), true);

// Обработка запросов от веб-формы
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['form_type']) && $_POST['form_type'] === 'contact') {
    // Получаем данные из формы
    $name = isset($_POST['name']) ? $_POST['name'] : 'Не указано';
    $phone = isset($_POST['phone']) ? $_POST['phone'] : 'Не указано';
    $email = isset($_POST['email']) ? $_POST['email'] : 'Не указано';
    $route = isset($_POST['route']) ? $_POST['route'] : 'Не указано';
    $cargo = isset($_POST['cargo']) ? $_POST['cargo'] : 'Не указано';
    $weight = isset($_POST['weight']) ? ($_POST['weight'] . ' кг') : 'Не указано';
    
    // Формируем текст сообщения
    $message = "
🚚 Новая заявка на перевозку!

👤 Имя: {$name}
📱 Телефон: {$phone}
✉️ Email: {$email}
🔄 Маршрут: {$route}
📦 Груз: {$cargo}
⚖️ Вес: {$weight}
    ";
    
    // Отправляем сообщение в Telegram
    sendMessage($adminChatId, $message);
    
    // Возвращаем успешный ответ
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
}

// Обработка запросов от Telegram
if (isset($update['message'])) {
    $message = $update['message'];
    $chatId = $message['chat']['id'];
    $text = isset($message['text']) ? $message['text'] : '';
    
    // Обработка команды /start
    if ($text === '/start') {
        $response = "👋 Здравствуйте! Я бот грузоперевозок на ГАЗели Челябинск-Магнитогорск.
        
🚚 С моей помощью вы можете:
- Узнать стоимость перевозки
- Уточнить расписание рейсов
- Оформить заказ
- Связаться с оператором

Выберите нужную команду или напишите ваш вопрос.";
        
        sendMessage($chatId, $response);
    }
    // Обработка команды /help
    else if ($text === '/help') {
        $response = "📌 Доступные команды:
/price - Узнать стоимость перевозки
/schedule - Расписание рейсов
/order - Оформить заказ
/contact - Связаться с оператором

При любых вопросах пишите в этот чат, и оператор свяжется с вами в ближайшее время!";
        
        sendMessage($chatId, $response);
    }
    // Обработка команды /price
    else if ($text === '/price') {
        $response = "💰 Стоимость грузоперевозки:

🔸 Челябинск → Магнитогорск: от 3500 ₽
🔸 Магнитогорск → Челябинск: от 3500 ₽

Окончательная стоимость зависит от:
- Веса и объема груза
- Сложности погрузки/разгрузки
- Дополнительных услуг

Для точного расчета используйте команду /order";
        
        sendMessage($chatId, $response);
    }
    // Обработка команды /schedule
    else if ($text === '/schedule') {
        $response = "🕒 Расписание рейсов:

🚚 Челябинск → Магнитогорск:
- Ежедневно в 08:00
- Ежедневно в 14:00

🚚 Магнитогорск → Челябинск:
- Ежедневно в 10:00
- Ежедневно в 16:00

⚠️ Возможна организация дополнительных рейсов по заявке.";
        
        sendMessage($chatId, $response);
    }
    // Обработка команды /order
    else if ($text === '/order') {
        $response = "📝 Для оформления заказа, пожалуйста, укажите:

1. Маршрут (откуда и куда)
2. Описание груза
3. Примерный вес и габариты
4. Предпочтительную дату и время
5. Контактный телефон

Или перейдите на наш сайт и заполните форму заказа онлайн:
https://ваш-сайт.рф/#order";
        
        sendMessage($chatId, $response);
    }
    // Обработка команды /contact
    else if ($text === '/contact') {
        $response = "☎️ Контактная информация:

📱 Телефон: +7 (900) 123-45-67
✉️ Email: info@ваш-сайт.рф
🕒 Режим работы: Ежедневно с 8:00 до 20:00

Для быстрой связи рекомендуем использовать телефон.";
        
        sendMessage($chatId, $response);
    }
    // Обработка всех остальных сообщений
    else {
        // Пересылаем сообщение администратору
        $userName = isset($message['from']['first_name']) ? $message['from']['first_name'] : '';
        $userLastName = isset($message['from']['last_name']) ? $message['from']['last_name'] : '';
        $username = isset($message['from']['username']) ? $message['from']['username'] : 'Нет username';
        
        $forwardMessage = "📩 Новое сообщение от пользователя:
        
👤 Имя: {$userName} {$userLastName}
🔗 Username: @{$username}
💬 Сообщение: {$text}";
        
        sendMessage($adminChatId, $forwardMessage);
        sendMessage($chatId, "✅ Ваше сообщение получено! Оператор ответит вам в ближайшее время.");
        
        // Если администратор сам написал боту, не нужно дублировать ответ
        if ($chatId != $adminChatId) {
            // Сохраняем ID пользователя для возможности ответа
            // В реальном проекте здесь можно сохранять в БД или файл
            file_put_contents('last_user_id.txt', $chatId);
        }
    }
}

// Функция для отправки сообщения в Telegram
function sendMessage($chatId, $text) {
    global $botToken;
    
    // Проверка наличия данных
    if (empty($chatId)) {
        error_log('Error: Chat ID is empty');
        return false;
    }
    
    $params = [
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];
    
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    // Используем cURL для отправки запроса
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    
    // Проверяем наличие ошибок
    if (curl_errno($ch)) {
        error_log('Curl error: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }
    
    curl_close($ch);
    return true;
}

// Для отладки - запись всех входящих данных в лог-файл (можно закомментировать в рабочей версии)
file_put_contents('bot_log.txt', date('Y-m-d H:i:s') . " - " . file_get_contents('php://input') . "\n", FILE_APPEND);
?> 
