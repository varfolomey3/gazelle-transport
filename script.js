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
            <a href="tel:+79001234567" class="phone"><i class="fas fa-phone"></i> +7 (900) 123-45-67</a>
            <div class="social-links">
                <a href="#" class="social-link"><i class="fab fa-telegram"></i></a>
                <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
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
    
    // Слайдер отзывов
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (testimonialsSlider && testimonials.length > 0) {
        let currentSlide = 0;
        let slideWidth = testimonials[0].offsetWidth + parseInt(window.getComputedStyle(testimonials[0]).marginLeft) + parseInt(window.getComputedStyle(testimonials[0]).marginRight);
        let maxSlide = testimonials.length - 1;
        
        // Для мобильной версии показываем по одному слайду
        function updateSliderView() {
            if (window.innerWidth <= 768) {
                maxSlide = testimonials.length - 1;
            } else {
                maxSlide = testimonials.length - 3;
                if (maxSlide < 0) maxSlide = 0;
            }
            
            slideWidth = testimonials[0].offsetWidth + parseInt(window.getComputedStyle(testimonials[0]).marginLeft) + parseInt(window.getComputedStyle(testimonials[0]).marginRight);
            goToSlide(currentSlide);
        }
        
        function goToSlide(slideIndex) {
            if (slideIndex < 0) slideIndex = 0;
            if (slideIndex > maxSlide) slideIndex = maxSlide;
            currentSlide = slideIndex;
            
            testimonialsSlider.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
        }
        
        prevBtn.addEventListener('click', function() {
            goToSlide(currentSlide - 1);
        });
        
        nextBtn.addEventListener('click', function() {
            goToSlide(currentSlide + 1);
        });
        
        // Инициализация слайдера
        updateSliderView();
        
        // Обновление при изменении размера экрана
        window.addEventListener('resize', updateSliderView);
    }
    
    // Форма обратной связи с интеграцией Telegram
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
            
            // ID бота и чата, в который будут приходить заявки
            // !!! ВАЖНО: Замените эти значения на свои реальные !!!
            const botToken = 'YOUR_TELEGRAM_BOT_TOKEN';
            const chatId = 'YOUR_CHAT_ID';
            
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
            
            // Функция для отправки в Telegram
            function sendToTelegram() {
                // В реальном проекте здесь будет отправка запроса к API Telegram
                // Для демо-версии имитируем успешную отправку
                
                // В рабочей версии раскомментируйте этот код и замените значения botToken и chatId
                /*
                fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        showSuccess();
                    } else {
                        // Если Telegram API вернул ошибку, все равно показываем успешную отправку
                        // В реальном проекте здесь должна быть обработка ошибок
                        showSuccess();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // В демо-версии показываем успех даже при ошибке
                    showSuccess();
                });
                */
                
                // Для демо показываем успешную отправку
                setTimeout(showSuccess, 1000);
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
            
            // Имитируем отправку формы
            sendToTelegram();
        });
    }
    
    // Обработчик для маски телефона (простая версия)
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
}); 