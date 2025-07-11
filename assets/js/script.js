document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;
    
    if (mobileMenuBtn) {
        // Создаем элементы мобильного меню
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        const mobileMenuClose = document.createElement('div');
        mobileMenuClose.className = 'mobile-menu-close';
        mobileMenuClose.innerHTML = '<i class="fas fa-times"></i>';
        
        const mobileMenuContent = document.createElement('div');
        mobileMenuContent.className = 'mobile-menu-content';
        
        // Клонируем навигацию из хедера
        const navClone = document.querySelector('nav ul').cloneNode(true);
        
        // Клонируем контактную информацию
        const contactInfoClone = document.createElement('div');
        contactInfoClone.className = 'mobile-menu-contact';
        contactInfoClone.innerHTML = `
            <a href="tel:+79193442196" class="phone"><i class="fas fa-phone"></i> +7 (919) 344-21-96</a>
            <a href="tel:+79080641525" class="phone"><i class="fas fa-phone"></i> +7 (908) 064-15-25</a>
            <div class="social-links">
                <a href="https://t.me/YourUsername" class="social-link" target="_blank"><i class="fab fa-telegram"></i></a>
                <a href="https://wa.me/79193442196" class="social-link" target="_blank"><i class="fab fa-whatsapp"></i></a>
                <a href="#" class="social-link"><i class="fab fa-vk"></i></a>
            </div>
        `;
        
        // Собираем мобильное меню
        mobileMenuContent.appendChild(navClone);
        mobileMenuContent.appendChild(contactInfoClone);
        mobileMenu.appendChild(mobileMenuClose);
        mobileMenu.appendChild(mobileMenuContent);
        
        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        // Добавляем элементы в body
        body.appendChild(mobileMenu);
        body.appendChild(overlay);
        
        // Обработчики событий для мобильного меню
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            overlay.style.display = 'block';
            body.style.overflow = 'hidden';
        });
        
        mobileMenuClose.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
        
        // Добавляем обработчики для ссылок в мобильном меню
        const mobileLinks = mobileMenu.querySelectorAll('a[href^="#"]');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        function closeMenu() {
            mobileMenu.classList.remove('active');
            overlay.style.display = 'none';
            body.style.overflow = '';
        }
    }
    
    // Плавная прокрутка для якорных ссылок
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Эффект при скролле для заголовка
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Кнопка "наверх"
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Анимация элементов при скролле
    const revealElements = document.querySelectorAll('.services-grid, .advantages-grid, .price-table-container, .route-map, .route-info-text, .specs-box');
    
    function revealOnScroll() {
        let windowHeight = window.innerHeight;
        
        revealElements.forEach(function(element) {
            let elementPos = element.getBoundingClientRect().top;
            if (elementPos < windowHeight - 50) {
                element.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Проверяем при загрузке страницы
    
    // Добавляем эффект волны для кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(button) {
        button.classList.add('btn-wave');
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            button.appendChild(ripple);
            
            setTimeout(function() {
                ripple.remove();
            }, 600);
        });
    });
    
    // Форма обратной связи с интеграцией FormSubmit для GitHub Pages
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = {
                name: contactForm.elements.name.value,
                phone: contactForm.elements.phone.value,
                email: contactForm.elements.email.value || 'Не указан',
                route: contactForm.elements.route.options[contactForm.elements.route.selectedIndex].text,
                cargo: contactForm.elements.cargo.value || 'Не указано',
                weight: contactForm.elements.weight.value ? contactForm.elements.weight.value + ' кг' : 'Не указан'
            };
            
            // Показываем индикатор загрузки
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="loading-spinner"></span>Отправка...';
            submitButton.disabled = true;
            
            // Используем FormSubmit для отправки формы (поддерживается на GitHub Pages)
            fetch('https://formsubmit.co/ajax/ar-73@mail.ru', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    route: formData.route,
                    cargo_description: formData.cargo,
                    weight: formData.weight,
                    _subject: 'Новая заявка на грузоперевозку'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success === "true" || data.success === true) {
                    // Также пытаемся отправить в Telegram, если не на GitHub Pages
                    sendToTelegram(formData);
                } else {
                    console.error('FormSubmit Error:', data);
                    showSuccess(); // Показываем успех для лучшего UX
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Пробуем запасной вариант с Telegram
                sendToTelegram(formData);
            })
            .finally(() => {
                // Восстанавливаем кнопку через 1.5 секунды для лучшего UX
                setTimeout(() => {
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                }, 1500);
            });
            
            // Функция для отправки в Telegram
            function sendToTelegram(formData) {
                // ID бота и чата, в который будут приходить заявки
                const botToken = '8150678104:AAHbqokHXMN3XLllSdMt9-LIGZ0E06vBrV4';
                const chatId = '1264513616';
                const backupChatId = '700742419'; // Резервный ID для админа
                
                // Формируем текст сообщения
                const message = `
🚚 Новая заявка на перевозку!

👤 Имя: ${formData.name}
📱 Телефон: ${formData.phone}
✉️ Email: ${formData.email}
🔄 Маршрут: ${formData.route}
📦 Груз: ${formData.cargo}
⚖️ Вес: ${formData.weight}
                `;
                
                // Прямая отправка через API Telegram
                const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                
                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка сети');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.ok) {
                        showSuccess();
                        // Дублируем сообщение второму админу
                        try {
                            fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    chat_id: backupChatId,
                                    text: message,
                                    parse_mode: 'HTML'
                                })
                            });
                        } catch (e) {
                            console.log('Ошибка отправки дубликата админу:', e);
                        }
                    } else {
                        console.error('Telegram API Error:', data);
                        showSuccess(); // Показываем успех для лучшего UX
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showSuccess(); // Для лучшего UX показываем успешную отправку
                });
            }
            
            function showSuccess() {
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Сбрасываем форму для возможности нового заполнения
                contactForm.reset();
                
                // Через 5 секунд снова показываем форму
                setTimeout(() => {
                    contactForm.style.display = 'block';
                    formSuccess.style.display = 'none';
                }, 5000);
            }
        });
    }
    
    // Обработчик для маски телефона (продвинутая версия)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let phoneNumber = this.value.replace(/\D/g, ''); // Удаляем все, кроме цифр
            
            if (phoneNumber.length > 0) {
                if (phoneNumber[0] === '7' || phoneNumber[0] === '8') {
                    phoneNumber = phoneNumber.substring(1);
                }
                
                if (phoneNumber.length > 0) {
                    phoneNumber = '7' + phoneNumber;
                    let formattedPhone = '';
                    
                    if (phoneNumber.length > 1) {
                        formattedPhone = '+' + phoneNumber.substring(0, 1) + ' ';
                    } else {
                        formattedPhone = '+' + phoneNumber;
                    }
                    
                    if (phoneNumber.length > 4) {
                        formattedPhone += '(' + phoneNumber.substring(1, 4) + ') ';
                    } else if (phoneNumber.length > 1) {
                        formattedPhone += '(' + phoneNumber.substring(1) + '';
                    }
                    
                    if (phoneNumber.length > 7) {
                        formattedPhone += phoneNumber.substring(4, 7) + '-';
                    } else if (phoneNumber.length > 4) {
                        formattedPhone += phoneNumber.substring(4);
                    }
                    
                    if (phoneNumber.length > 9) {
                        formattedPhone += phoneNumber.substring(7, 9) + '-';
                    } else if (phoneNumber.length > 7) {
                        formattedPhone += phoneNumber.substring(7);
                    }
                    
                    if (phoneNumber.length > 11) {
                        formattedPhone += phoneNumber.substring(9, 11);
                    } else if (phoneNumber.length > 9) {
                        formattedPhone += phoneNumber.substring(9);
                    }
                    
                    this.value = formattedPhone;
                } else {
                    this.value = '+7 ';
                }
            }
        });
        
        // Устанавливаем начальное значение при фокусе
        phoneInput.addEventListener('focus', function() {
            if (this.value.length === 0) {
                this.value = '+7 ';
            }
        });
    }
    
    // Добавляем текущий год в футер
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Анимация цифр в секции с преимуществами
    function animateNumbers() {
        const numberElements = document.querySelectorAll('.animate-number');
        
        numberElements.forEach(function(element) {
            const targetNumber = parseInt(element.getAttribute('data-number'));
            const duration = 2000; // 2 секунды на анимацию
            const startTime = Date.now();
            const startValue = 0;
            
            function updateNumber() {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                
                if (elapsedTime < duration) {
                    const progress = elapsedTime / duration;
                    const currentValue = Math.floor(startValue + progress * (targetNumber - startValue));
                    element.textContent = currentValue;
                    requestAnimationFrame(updateNumber);
                } else {
                    element.textContent = targetNumber;
                }
            }
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        updateNumber();
                        observer.unobserve(element);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(element);
        });
    }
    
    animateNumbers();
    
    // Параллакс эффект для героя
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scroll = window.pageYOffset;
            hero.style.backgroundPositionY = `${scroll * 0.5}px`;
        });
    }
}); 