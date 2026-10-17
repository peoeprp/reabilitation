
 // ==========================================================
 // Бочкарёв Иван Александрович — врач-реабилитолог
 // ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Подключение к Supabase ----------
  const SUPABASE_URL = 'https://xiencrkhuejuvvpkiunv.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oKu7H6Z0U1Ql1cVfPF7wZg_AYnBlcMB';

  const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  ) ?? null;

  if (!supabaseClient) {
    console.error('Supabase не подключён. Проверьте загрузку библиотеки CDN.');
  }

  // ---------- Шапка: фон при прокрутке ----------
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Мобильное меню ----------
  const setMenu = (open) => {
    if (!nav || !burger) return;

    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
  };

  burger?.addEventListener('click', () => {
    setMenu(!nav?.classList.contains('is-open'));
  });

  nav?.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  window.matchMedia('(min-width: 700px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  // ---------- Плавная прокрутка ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  // ---------- Подсветка активного пункта меню ----------
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  const linkById = new Map(
    navLinks
      .filter((link) => link.getAttribute('href')?.startsWith('#'))
      .map((link) => [link.getAttribute('href').slice(1), link])
  );

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = linkById.get(entry.target.id);

        if (!link || !entry.isIntersecting) return;

        navLinks.forEach((item) => {
          item.classList.toggle('is-active', item === link);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    linkById.forEach((_, id) => {
      const element = document.getElementById(id);
      if (element) spy.observe(element);
    });
  }

  // ---------- Анимация появления блоков ----------
  const revealTargets = document.querySelectorAll(
    '.hero__content, .hero__photo, .section-title, ' +
    '.about__content, .about__visual, .rehab__intro, .rehab-step, .rehab__principle, ' +
    '.situations__header, .situations__copy, .situations__photo-wrap, ' +
    '.section-heading, .document-card, .documents__note, .reviews__empty, ' +
    '.footer__main'
  );

  revealTargets.forEach((element, index) => {
    if (element.matches('.rehab-step, .document-card')) {
      element.style.transitionDelay = `${(index % 3) * 80}ms`;
    }

    element.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px'
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  }

  // ---------- Карусель услуг ----------
  const track = document.getElementById('cards');
  const prevBtn = document.getElementById('cardsPrev');
  const nextBtn = document.getElementById('cardsNext');
  const cards = track ? Array.from(track.querySelectorAll('.card')) : [];

  if (track && prevBtn && nextBtn && cards.length) {
    const clamp = (index) => Math.max(0, Math.min(cards.length - 1, index));

    const centerOf = (card) =>
      card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;

    const currentIndex = () => {
      let best = 0;
      let distance = Infinity;

      cards.forEach((card, index) => {
        const currentDistance = Math.abs(centerOf(card) - track.scrollLeft);

        if (currentDistance < distance) {
          distance = currentDistance;
          best = index;
        }
      });

      return best;
    };

    const goTo = (index, instant = false) => {
      track.scrollTo({
        left: centerOf(cards[clamp(index)]),
        behavior: instant || reduceMotion ? 'auto' : 'smooth'
      });
    };

    const updateArrows = () => {
      const index = currentIndex();
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === cards.length - 1;
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

    track.addEventListener('scroll', updateArrows, { passive: true });

    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(currentIndex() - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(currentIndex() + 1);
      }
    });

    goTo(cards.length > 2 ? 1 : 0, true);
    updateArrows();

    let resizeTimer;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        goTo(currentIndex(), true);
        updateArrows();
      }, 120);
    });

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;

      isDown = true;
      startX = lastX = event.clientX;
      startScroll = track.scrollLeft;
      lastT = performance.now();
      velocity = 0;

      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', (event) => {
      if (!isDown) return;

      const now = performance.now();
      const deltaTime = now - lastT;

      if (deltaTime > 0) {
        velocity = (lastX - event.clientX) / deltaTime;
      }

      lastX = event.clientX;
      lastT = now;

      track.scrollLeft = startScroll - (event.clientX - startX);
    });

    const stopDrag = () => {
      if (!isDown) return;

      isDown = false;
      track.classList.remove('is-dragging');

      let index = currentIndex();

      if (Math.abs(velocity) > 0.4) {
        index += velocity > 0 ? 1 : -1;
      }

      goTo(index);
    };

    track.addEventListener('pointerup', stopDrag);
    track.addEventListener('pointercancel', stopDrag);
    track.addEventListener('lostpointercapture', stopDrag);
    track.addEventListener('dragstart', (event) => event.preventDefault());
  }

  // ---------- Переключатель «Дети / Взрослые» ----------
  const audienceButtons = Array.from(
    document.querySelectorAll('.audience-switch__button')
  );

  const situationPanel = document.getElementById('situation-content');
  const situationsHeadline = document.querySelector('.situations__headline');
  const situationsDescription = document.querySelector('.situations__description');
  const situationList = document.getElementById('situation-list');
  const situationPhoto = document.querySelector('.situations__photo');
  const topBadge = document.querySelector('.situations-badge--top');
  const bottomBadge = document.querySelector('.situations-badge--bottom');
  const audienceSwitch = document.querySelector('.audience-switch');

  const audienceContent = {
    children: {
      headline: 'Реабилитация детей с первых месяцев жизни',
      description: 'Индивидуальный подход к двигательному развитию, особенностям здоровья и потребностям ребёнка.',
      photoAlt: 'Индивидуальная реабилитация ребёнка',
      topBadge: 'Оценка развития',
      bottomBadge: 'Индивидуальная программа',
      items: [
        [
          'Особенности двигательного развития',
          'Если вы замечаете необычные особенности движений, контроля положения тела или освоения навыков, обсудите их с педиатром и профильным специалистом.'
        ],
        [
          'Установленные патологии и неврологические нарушения',
          'При наличии диагноза или рекомендаций врача может потребоваться индивидуальная программа с учётом состояния ребёнка.'
        ],
        [
          'Поддержка двигательных навыков',
          'ЛФК и физическая терапия могут применяться для работы над двигательными навыками, если это соответствует индивидуальным показаниям.'
        ],
        [
          'Дополнительные методы реабилитации',
          'Лечебный массаж и гидрокинезиология рассматриваются как элементы программы, если подходят ребёнку по возрасту и состоянию.'
        ]
      ]
    },

    adults: {
      headline: 'Восстановление подвижности и качества жизни',
      description: 'Подбор методов с учётом самочувствия, повседневной активности и рекомендаций лечащего врача.',
      photoAlt: 'Специалист помогает восстановить движение и подвижность',
      topBadge: 'Работа с подвижностью',
      bottomBadge: 'Комплексный подход',
      items: [
        [
          'Ограничение подвижности',
          'Если движения стали менее свободными или привычная активность вызывает дискомфорт, можно обсудить варианты восстановления.'
        ],
        [
          'Мышечное напряжение и дискомфорт',
          'Лечебный массаж может рассматриваться как часть плана помощи после оценки состояния и возможных противопоказаний.'
        ],
        [
          'Восстановление после травм или заболеваний',
          'Содержание реабилитации определяется индивидуально с учётом диагноза, рекомендаций врача и текущих функциональных возможностей.'
        ],
        [
          'Возвращение к повседневной активности',
          'Комплексная работа может быть направлена на постепенное восстановление доступных движений и привычной активности.'
        ]
      ]
    }
  };

  let currentAudience = 'children';
  let swapTimer;

  const renderAudience = (audience) => {
    const data = audienceContent[audience];

    if (!data || !situationList) return;

    if (situationsHeadline) situationsHeadline.textContent = data.headline;
    if (situationsDescription) situationsDescription.textContent = data.description;
    if (situationPhoto) situationPhoto.alt = data.photoAlt;
    if (topBadge) topBadge.textContent = data.topBadge;
    if (bottomBadge) bottomBadge.textContent = data.bottomBadge;

    situationList.replaceChildren();

    data.items.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'situation-item';

      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');

      const copy = document.createElement('div');
      const title = document.createElement('h4');
      const paragraph = document.createElement('p');

      title.textContent = item[0];
      paragraph.textContent = item[1];

      copy.append(title, paragraph);
      article.append(number, copy);
      situationList.append(article);
    });

    audienceButtons.forEach((button) => {
      const active = button.dataset.audience === audience;

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    situationPanel?.setAttribute(
      'aria-labelledby',
      audience === 'children' ? 'tab-children' : 'tab-adults'
    );
  };

  const switchAudience = (audience) => {
    if (!audienceContent[audience] || audience === currentAudience) return;

    currentAudience = audience;
    audienceSwitch?.setAttribute('data-active', audience);

    audienceButtons.forEach((button) => {
      const active = button.dataset.audience === audience;

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    clearTimeout(swapTimer);

    if (reduceMotion || !situationPanel) {
      renderAudience(audience);
      return;
    }

    situationPanel.classList.add('is-swapping');

    swapTimer = setTimeout(() => {
      renderAudience(audience);
      situationPanel.classList.remove('is-swapping');
    }, 220);
  };

  audienceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchAudience(button.dataset.audience);
    });

    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

      event.preventDefault();

      const nextAudience =
        button.dataset.audience === 'children' ? 'adults' : 'children';

      switchAudience(nextAudience);

      audienceButtons
        .find((candidate) => candidate.dataset.audience === nextAudience)
        ?.focus();
    });
  });

  // ---------- Универсальные модальные окна ----------
  const modals = Array.from(document.querySelectorAll('.modal'));
  let previouslyFocused = null;

  const openModal = (modal) => {
    if (!modal) return;

    previouslyFocused = document.activeElement;

    modals.forEach((item) => {
      item.classList.remove('is-open');
      item.setAttribute('aria-hidden', 'true');
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    (
      modal.querySelector('input, select, textarea') ||
      modal.querySelector('button')
    )?.focus({ preventScroll: true });
  };

  const closeModal = (modal) => {
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    if (!modals.some((item) => item.classList.contains('is-open'))) {
      document.body.classList.remove('modal-open');
    }

    previouslyFocused?.focus?.();
  };

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openModal(document.getElementById(trigger.dataset.openModal));
    });
  });

  modals.forEach((modal) => {
    modal.querySelectorAll('[data-close-modal]').forEach((control) => {
      control.addEventListener('click', () => closeModal(modal));
    });
  });

  // Фокус не уходит за пределы открытого окна
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const opened = modals.find((modal) => modal.classList.contains('is-open'));
    if (!opened) return;

    const focusable = Array.from(
      opened.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
      )
    ).filter((element) => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const opened = modals.find((modal) => modal.classList.contains('is-open'));

    if (opened) closeModal(opened);
  });

  // ---------- Контактные ссылки ----------
  document.querySelectorAll('[data-contact-placeholder]').forEach((link) => {
    link.addEventListener('click', () => {
      link.setAttribute(
        'title',
        'Проверьте, что ссылка ведёт на актуальный контакт специалиста'
      );
    });
  });

  // ---------- Уведомления ----------
  const toast = document.getElementById('toast');
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4200);
  };

  // ---------- Формирование сообщения для Telegram ----------
  const makeMessage = (form) => {
    const data = new FormData(form);

    const lines = [
      'Запрос на консультацию',
      `Для кого: ${data.get('audience') || ''}`,
      `Возраст: ${data.get('age') || ''}`,
      `Имя: ${data.get('name') || ''}`,
      '',
      'Описание ситуации и цель обращения:',
      data.get('message') || '',
      data.get('details')
        ? `Дополнительная информация: ${data.get('details')}`
        : ''
    ];

    return lines.filter((line) => line !== '').join('\n');
  };

  const sendViaMessenger = (message) => {
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ---------- Форма консультации: Telegram ----------
  const consultForm = document.getElementById('consult-form');

  consultForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!consultForm.reportValidity()) return;

    sendViaMessenger(makeMessage(consultForm));
    closeModal(document.getElementById('consult-modal'));

    showToast(
      'Сообщение подготовлено в Telegram — отправьте его, чтобы завершить запись.'
    );
  });

  // ---------- Форма отзыва: Supabase ----------
  const reviewForm = document.getElementById('review-form');

  reviewForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!reviewForm.reportValidity()) return;

    if (!supabaseClient) {
      showToast('Сервис отзывов временно недоступен. Попробуйте позже.');
      console.error('Supabase не инициализирован.');
      return;
    }

    const formData = new FormData(reviewForm);
    const submitButton = reviewForm.querySelector('[type="submit"]');
    const originalButtonText = submitButton?.textContent || 'Отправить отзыв';

    const consent = formData.get('reviewConsent') === 'on';

    if (!consent) {
      showToast('Для отправки отзыва необходимо подтвердить согласие.');
      return;
    }

    const review = {
      reviewer: String(formData.get('reviewer') || '').trim(),
      review_audience: String(formData.get('reviewAudience') || ''),
      review_text: String(formData.get('reviewText') || '').trim(),
      review_consent: consent
    };

    if (
      review.reviewer.length < 2 ||
      review.reviewer.length > 80 ||
      !['Ребёнок', 'Взрослый'].includes(review.review_audience) ||
      review.review_text.length < 20 ||
      review.review_text.length > 3000
    ) {
      showToast('Проверьте заполнение полей формы.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправка...';
    }

    try {
      const { error } = await supabaseClient
        .from('reviews')
        .insert([review]);

      if (error) {
        console.error('Ошибка сохранения отзыва:', error);
        showToast('Не удалось отправить отзыв. Попробуйте ещё раз.');
        return;
      }

      reviewForm.reset();
      closeModal(document.getElementById('review-modal'));

      showToast(
        'Спасибо! Отзыв отправлен на проверку. После модерации он может появиться на сайте.'
      );
    } catch (error) {
      console.error('Ошибка соединения с Supabase:', error);

      showToast(
        'Ошибка соединения. Проверьте интернет и попробуйте ещё раз.'
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });

  // ---------- Текущий год в футере ----------
  const year = document.getElementById('current-year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
});
