// ==========================================================
// Бочкарёв Иван Александрович — врач-реабилитолог
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Шапка: фон при прокрутке ----------
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Мобильное меню (кнопка «з») ----------
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__link').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // если окно расширили до десктопа — закрываем мобильное меню
  window.matchMedia('(min-width: 700px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ---------- Плавная прокрутка с учётом высоты шапки ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // ---------- Анимация появления блоков ----------
  const revealTargets = document.querySelectorAll(
    '.hero__content, .hero__photo, .section-title, ' +
    '.about__title, .about__tag, .about__text, .parents__title, .parents__list li'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Карусель услуг ----------
  // Свайп (тач), перетягивание мышью, стрелки, клавиши ← →.
  // Карточка всегда «примагничивается» к центру экрана.
  const track = document.getElementById('cards');
  const prevBtn = document.getElementById('cardsPrev');
  const nextBtn = document.getElementById('cardsNext');
  const cards = track ? Array.from(track.querySelectorAll('.card')) : [];

  if (track && prevBtn && nextBtn && cards.length) {
    const clamp = (i) => Math.max(0, Math.min(cards.length - 1, i));

    // scrollLeft, при котором карточка стоит по центру
    const centerOf = (card) => card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;

    const currentIndex = () => {
      let best = 0;
      let dist = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(centerOf(card) - track.scrollLeft);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };

    const goTo = (index, instant = false) => {
      track.scrollTo({
        left: centerOf(cards[clamp(index)]),
        behavior: instant || reduceMotion ? 'instant' : 'smooth',
      });
    };

    const updateArrows = () => {
      const i = currentIndex();
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === cards.length - 1;
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

    track.addEventListener('scroll', updateArrows, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
    });

    // начальное положение: вторая карточка по центру, слева и справа видны соседи
    let active = cards.length > 2 ? 1 : 0;
    goTo(active, true);
    updateArrows();

    // при изменении размера окна держим выбранную карточку по центру
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { goTo(currentIndex(), true); updateArrows(); }, 120);
    });

    // ----- перетягивание мышью (на телефоне работает обычный свайп) -----
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;                         // px/мс, > 0 — тянем влево (к следующей)

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      isDown = true;
      startX = lastX = e.clientX;
      startScroll = track.scrollLeft;
      lastT = performance.now();
      velocity = 0;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (lastX - e.clientX) / dt;
      lastX = e.clientX;
      lastT = now;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });

    const stopDrag = () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
      let index = currentIndex();
      // быстрый «бросок» мышью — листаем на следующую / предыдущую
      if (Math.abs(velocity) > 0.4) index += velocity > 0 ? 1 : -1;
      goTo(index);
    };
    track.addEventListener('pointerup', stopDrag);
    track.addEventListener('pointercancel', stopDrag);
    track.addEventListener('lostpointercapture', stopDrag);

    // не даём браузеру «утаскивать» картинки
    track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // ---------- Переключатель «Дети / Взрослые» ----------
  const audienceButtons = Array.from(document.querySelectorAll('.audience-switch__button'));
  const situationPanel = document.getElementById('situation-content');
  const situationsHeadline = document.querySelector('.situations__headline');
  const situationsDescription = document.querySelector('.situations__description');
  const situationList = document.getElementById('situation-list');
  const situationPhoto = document.querySelector('.situations__photo');
  const topBadge = document.querySelector('.situations-badge--top');
  const bottomBadge = document.querySelector('.situations-badge--bottom');

  const audienceContent = {
    children: {
      headline: 'Реабилитация детей с первых месяцев жизни',
      description: 'Индивидуальный подход к двигательному развитию, особенностям здоровья и потребностям ребёнка.',
      photoAlt: 'Индивидуальная реабилитация ребёнка',
      topBadge: 'Оценка развития', bottomBadge: 'Индивидуальная программа',
      items: [
        ['Особенности двигательного развития', 'Если вы замечаете необычные особенности движений, контроля положения тела или освоения навыков, обсудите их с педиатром и профильным специалистом.'],
        ['Установленные патологии и неврологические нарушения', 'При наличии диагноза или рекомендаций врача может потребоваться индивидуальная программа с учётом состояния ребёнка.'],
        ['Поддержка двигательных навыков', 'ЛФК и физическая терапия могут применяться для работы над двигательными навыками, если это соответствует индивидуальным показаниям.'],
        ['Дополнительные методы реабилитации', 'Лечебный массаж и гидрокинезиология рассматриваются как элементы программы, если подходят ребёнку по возрасту и состоянию.']
      ]
    },
    adults: {
      headline: 'Восстановление подвижности и качества жизни',
      description: 'Подбор методов с учётом самочувствия, повседневной активности и рекомендаций лечащего врача.',
      photoAlt: 'Специалист помогает восстановить движение и подвижность',
      topBadge: 'Работа с подвижностью', bottomBadge: 'Комплексный подход',
      items: [
        ['Ограничение подвижности', 'Если движения стали менее свободными или привычная активность вызывает дискомфорт, можно обсудить варианты восстановления.'],
        ['Мышечное напряжение и дискомфорт', 'Лечебный массаж может рассматриваться как часть плана помощи после оценки состояния и возможных противопоказаний.'],
        ['Восстановление после травм или заболеваний', 'Содержание реабилитации определяется индивидуально с учётом диагноза, рекомендаций врача и текущих функциональных возможностей.'],
        ['Возвращение к повседневной активности', 'Комплексная работа может быть направлена на постепенное восстановление доступных движений и привычной активности.']
      ]
    }
  };

  const renderAudience = (audience) => {
    const data = audienceContent[audience];
    if (!data || !situationList) return;
    situationsHeadline.textContent = data.headline;
    situationsDescription.textContent = data.description;
    situationPhoto.alt = data.photoAlt;
    topBadge.textContent = data.topBadge;
    bottomBadge.textContent = data.bottomBadge;
    situationList.replaceChildren();
    data.items.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'situation-item';
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = item[0];
      const paragraph = document.createElement('p');
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
    situationPanel.setAttribute('aria-labelledby', audience === 'children' ? 'tab-children' : 'tab-adults');
  };

  audienceButtons.forEach((button) => {
    button.addEventListener('click', () => renderAudience(button.dataset.audience));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const nextAudience = button.dataset.audience === 'children' ? 'adults' : 'children';
      const nextButton = audienceButtons.find((candidate) => candidate.dataset.audience === nextAudience);
      renderAudience(nextAudience);
      nextButton?.focus();
    });
  });
});
