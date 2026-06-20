const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const header = document.querySelector('[data-header]');
const mobileCallbar = document.querySelector('[data-mobile-callbar]');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}

if (header) {
  const setHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

if (mobileCallbar) {
  const setCallbarState = () => {
    mobileCallbar.classList.toggle('is-visible', window.scrollY > 520);
  };
  setCallbarState();
  window.addEventListener('scroll', setCallbarState, { passive: true });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const serviceTabs = document.querySelectorAll('[data-service-filter]');
const serviceGroups = document.querySelectorAll('[data-service-group]');

serviceTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const filter = tab.getAttribute('data-service-filter') || 'all';

    serviceTabs.forEach((item) => item.classList.toggle('is-active', item === tab));

    serviceGroups.forEach((group) => {
      const matches = filter === 'all' || group.getAttribute('data-service-group') === filter;
      group.classList.toggle('is-hidden', !matches);

      if (matches && filter !== 'all') {
        group.setAttribute('open', '');
      }
    });
  });
});

document.querySelectorAll('.rail-section').forEach((section) => {
  const rail = section.querySelector('[data-rail]');
  const prev = section.querySelector('[data-rail-prev]');
  const next = section.querySelector('[data-rail-next]');

  if (!rail) return;

  const scrollByCard = (direction) => {
    const firstCard = rail.firstElementChild;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
    rail.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
  };

  if (prev) {
    prev.addEventListener('click', () => scrollByCard(-1));
  }

  if (next) {
    next.addEventListener('click', () => scrollByCard(1));
  }
});

const form = document.querySelector('[data-lead-form]');

if (form) {
  const nameInput = form.querySelector('#name');
  const phoneInput = form.querySelector('#phone');
  const submitButton = form.querySelector('button[type="submit"]');
  const isStaticPreview = form.dataset.staticForm === 'true';

  const setError = (name, message) => {
    const node = form.querySelector(`[data-error-for="${name}"]`);
    if (node) node.textContent = message;
  };

  const showFormAlert = (message, ok = true) => {
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `form-alert ${ok ? 'is-success' : 'is-error'}`;
    alert.setAttribute('role', 'status');
    alert.textContent = message;
    form.prepend(alert);
  };

  const validate = () => {
    let valid = true;
    setError('name', '');
    setError('phone', '');

    if (nameInput.value.trim().length < 2) {
      setError('name', 'Укажите имя, чтобы мастер понимал, к кому обратиться.');
      valid = false;
    }

    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('phone', 'Укажите телефон для обратного звонка.');
      valid = false;
    }

    return valid;
  };

  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener('blur', validate);
  });

  form.addEventListener('submit', async (event) => {
    if (!validate()) {
      event.preventDefault();
      return;
    }

    if (!window.fetch) return;

    event.preventDefault();

    if (isStaticPreview) {
      showFormAlert('Это статическая версия для просмотра. Для записи позвоните по номеру на сайте.');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Передаем заявку...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'fetch',
        },
      });
      const result = await response.json();
      showFormAlert(result.message, Boolean(result.ok));

      if (result.ok) {
        form.reset();
      }
    } catch (error) {
      showFormAlert('Форма не отправилась. Позвоните напрямую.', false);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Записаться на диагностику';
    }
  });
}
