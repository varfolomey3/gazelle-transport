#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import json
import os
from datetime import datetime, timedelta
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Updater,
    CommandHandler,
    MessageHandler,
    Filters,
    ConversationHandler,
    CallbackContext,
    CallbackQueryHandler
)

# Включаем логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)

logger = logging.getLogger(__name__)

# Константы для этапов диалога
NAME, PHONE, ROUTE, CARGO_DESC, WEIGHT, CONFIRMATION = range(6)

# Константы для маршрутов
CHEL_MAG = "Челябинск → Магнитогорск"
MAG_CHEL = "Магнитогорск → Челябинск"

# Файл для хранения заявок
ORDERS_FILE = "orders.json"

def load_orders():
    """Загружает заявки из файла"""
    if os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_order(order_data):
    """Сохраняет заявку в файл"""
    orders = load_orders()
    orders.append(order_data)
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, ensure_ascii=False, indent=4)

def start(update: Update, context: CallbackContext) -> int:
    """Начало диалога и отправка приветственного сообщения"""
    user = update.effective_user
    update.message.reply_text(
        f'Здравствуйте, {user.first_name}! 👋\n\n'
        f'Я бот для записи на грузоперевозку по маршрутам Челябинск-Магнитогорск.\n\n'
        f'Для оформления заявки, пожалуйста, укажите необходимую информацию.\n\n'
        f'Как вас зовут?'
    )
    
    # Инициализируем словарь пользовательских данных
    context.user_data['order'] = {}
    
    return NAME

def get_name(update: Update, context: CallbackContext) -> int:
    """Получение имени и запрос номера телефона"""
    name = update.message.text
    context.user_data['order']['name'] = name
    
    update.message.reply_text(
        f'Приятно познакомиться, {name}!\n\n'
        f'Теперь, пожалуйста, укажите ваш номер телефона для связи:'
    )
    
    return PHONE

def get_phone(update: Update, context: CallbackContext) -> int:
    """Получение номера телефона и запрос маршрута"""
    phone = update.message.text
    context.user_data['order']['phone'] = phone
    
    reply_keyboard = [[CHEL_MAG], [MAG_CHEL]]
    
    update.message.reply_text(
        'Спасибо! Теперь выберите маршрут:',
        reply_markup=ReplyKeyboardMarkup(
            reply_keyboard, one_time_keyboard=True, resize_keyboard=True
        ),
    )
    
    return ROUTE

def get_route(update: Update, context: CallbackContext) -> int:
    """Получение маршрута и запрос описания груза"""
    route = update.message.text
    context.user_data['order']['route'] = route
    
    update.message.reply_text(
        'Теперь опишите ваш груз (что перевозим, габариты, особенности):',
        reply_markup=ReplyKeyboardRemove(),
    )
    
    return CARGO_DESC

def get_cargo_desc(update: Update, context: CallbackContext) -> int:
    """Получение описания груза и запрос веса"""
    cargo_desc = update.message.text
    context.user_data['order']['cargo_desc'] = cargo_desc
    
    update.message.reply_text(
        'Укажите примерный вес груза в килограммах (только число):\n'
        'Например: 500'
    )
    
    return WEIGHT

def get_weight(update: Update, context: CallbackContext) -> int:
    """Получение веса груза и запрос подтверждения"""
    try:
        weight = int(update.message.text)
        context.user_data['order']['weight'] = weight
    except ValueError:
        update.message.reply_text(
            'Пожалуйста, введите только число (без единиц измерения).\n'
            'Например: 500'
        )
        return WEIGHT
    
    order_data = context.user_data['order']
    
    # Показываем сводку и запрашиваем подтверждение
    message = (
        f"📋 *Проверьте данные вашей заявки:*\n\n"
        f"👤 *Имя:* {order_data['name']}\n"
        f"📱 *Телефон:* {order_data['phone']}\n"
        f"🔄 *Маршрут:* {order_data['route']}\n"
        f"📦 *Описание груза:* {order_data['cargo_desc']}\n"
        f"⚖️ *Вес груза:* {order_data['weight']} кг\n\n"
        f"Всё верно? Подтвердите заявку:"
    )
    
    keyboard = [
        [InlineKeyboardButton("✅ Подтвердить", callback_data="confirm")],
        [InlineKeyboardButton("❌ Отменить", callback_data="cancel")]
    ]
    
    update.message.reply_text(
        message,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode='Markdown'
    )
    
    return CONFIRMATION

def confirm_order(update: Update, context: CallbackContext) -> int:
    """Обработка подтверждения или отмены заказа"""
    query = update.callback_query
    query.answer()
    
    if query.data == "confirm":
        # Добавляем дату создания заявки
        order_data = context.user_data['order']
        order_data['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Сохраняем заявку
        save_order(order_data)
        
        # Отправляем уведомление администратору
        admin_notification = (
            f"🚚 *НОВАЯ ЗАЯВКА НА ПЕРЕВОЗКУ!*\n\n"
            f"👤 *Имя:* {order_data['name']}\n"
            f"📱 *Телефон:* {order_data['phone']}\n"
            f"🔄 *Маршрут:* {order_data['route']}\n"
            f"📦 *Описание груза:* {order_data['cargo_desc']}\n"
            f"⚖️ *Вес груза:* {order_data['weight']} кг\n"
            f"⏰ *Время:* {order_data['timestamp']}"
        )
        
        # Здесь вместо ADMIN_ID нужно подставить ваш Telegram ID
        context.bot.send_message(chat_id=1264513616, text=admin_notification, parse_mode='Markdown')
        
        query.edit_message_text(
            text="✅ Спасибо! Ваша заявка принята.\n\n"
                 "Мы свяжемся с вами в ближайшее время для уточнения деталей перевозки.\n\n"
                 "Для оформления новой заявки, используйте команду /start",
            reply_markup=None
        )
        
    else:  # cancel
        query.edit_message_text(
            text="❌ Заявка отменена.\n\n"
                 "Для создания новой заявки, используйте команду /start",
            reply_markup=None
        )
    
    # Очищаем данные пользователя
    context.user_data.clear()
    return ConversationHandler.END

def cancel(update: Update, context: CallbackContext) -> int:
    """Отмена и завершение диалога"""
    update.message.reply_text(
        'Заявка отменена. Если захотите оформить заявку позже, используйте команду /start',
        reply_markup=ReplyKeyboardRemove()
    )
    
    # Очищаем данные пользователя
    context.user_data.clear()
    return ConversationHandler.END

def help_command(update: Update, context: CallbackContext) -> None:
    """Отправляет сообщение с помощью при команде /help"""
    update.message.reply_text(
        '🔍 *Помощь по использованию бота*\n\n'
        '• Для начала оформления заявки используйте команду /start\n'
        '• Для отмены текущего оформления используйте команду /cancel\n\n'
        '📱 Контакты для связи:\n'
        '• +7 (919) 344-21-96\n'
        '• +7 (908) 064-15-25\n'
        '• ar-73@mail.ru\n\n'
        '🚚 Осуществляю грузоперевозки на ГАЗели между Челябинском и Магнитогорском\n'
        '📦 Перевозка грузов до 1.5 тонн\n'
        '📏 Внутренние размеры: 4,2 × 2,14 × 1,92 м\n'
        '✅ Возможна оплата по безналичному расчету без НДС',
        parse_mode='Markdown'
    )

def main() -> None:
    """Запуск бота"""
    # Создаем Updater и передаем ему токен бота
    # Здесь нужно вставить токен вашего бота, полученный у @BotFather
    updater = Updater("8150678104:AAHbqokHXMN3XLllSdMt9-LIGZ0E06vBrV4")
    
    # Получаем диспетчер для регистрации обработчиков
    dispatcher = updater.dispatcher
    
    # Определяем обработчик диалога для оформления заявки
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', start)],
        states={
            NAME: [MessageHandler(Filters.text & ~Filters.command, get_name)],
            PHONE: [MessageHandler(Filters.text & ~Filters.command, get_phone)],
            ROUTE: [MessageHandler(Filters.regex(f'^({CHEL_MAG}|{MAG_CHEL})$'), get_route)],
            CARGO_DESC: [MessageHandler(Filters.text & ~Filters.command, get_cargo_desc)],
            WEIGHT: [MessageHandler(Filters.text & ~Filters.command, get_weight)],
            CONFIRMATION: [CallbackQueryHandler(confirm_order)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )
    
    # Добавляем обработчики
    dispatcher.add_handler(conv_handler)
    dispatcher.add_handler(CommandHandler("help", help_command))
    
    # Запускаем бота
    updater.start_polling()
    
    # Останавливаем бота при нажатии Ctrl-C
    updater.idle()

if __name__ == '__main__':
    main() 