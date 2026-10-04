// ==========================================
// 1. КОНФІГУРАЦІЯ ТА СТАН
// ==========================================

// Перенаправлення за ролями
const ROLE_PAGES = {
  admin: 'admin_dashboard.html',
  manager: 'manager_dashboard.html',
  outsource: 'outsource_dashboard.html'
};

let currentAuthTab = 'login';
let currentLang = 'UA';

// Словар локалізації
const translations = {
  UA: {
    titleLogin: "Авторизація",
    titleRegister: "Реєстрація",
    subtitle: "Управління заявками та персоналом складу",
    tabLogin: "Вхід",
    tabRegister: "Реєстрація",
    btnSubmitLogin: "Увійти в акаунт",
    btnSubmitRegister: "Зареєструватися"
  },
  EN: {
    titleLogin: "Authorization",
    titleRegister: "Registration",
    subtitle: "Request and warehouse staff management",
    tabLogin: "Login",
    tabRegister: "Register",
    btnSubmitLogin: "Sign In",
    btnSubmitRegister: "Sign Up"
  }
};

// ==========================================
// 2. БАЗА ДАНИХ (LOCALSTORAGE)
// ==========================================

// Отримання списку всіх зареєстрованих користувачів
function getUsers() {
  return JSON.parse(localStorage.getItem('registeredUsers')) || [];
}

// Збереження нового користувача
function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Отримання списку дозволених номерів для Аутсорсу (додає Менеджер)
function getAllowedOutsourcePhones() {
  // За замовчуванням додамо декілька тестових номерів, якщо список порожній
  const defaultAllowed = ['0000000003', '0991234567'];
  const stored = localStorage.getItem('allowedOutsourcePhones');
  return stored ? JSON.parse(stored) : defaultAllowed;
}

// ==========================================
// 3. ОБРОБКА ФОРМИ (ВХІД ТА РЕЄСТРАЦІЯ)
// ==========================================

function handleAuthSubmit(event) {
  event.preventDefault();

  const role = document.getElementById('authRole').value;
  const phone = document.getElementById('authPhone').value.trim();
  const password = document.getElementById('authPassword').value;
  const warehouse = document.getElementById('authWarehouse') ? document.getElementById('authWarehouse').value : null;

  const users = getUsers();

  // ----------------------------------------
  // РЕЖИМ РЕЄСТРАЦІЇ (REGISTER)
  // ----------------------------------------
  if (currentAuthTab === 'register') {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();

    if (!firstName || !lastName) {
      alert(currentLang === 'UA' ? 'Будь ласка, заповніть ім\'я та прізвище!' : 'Please fill in your name!');
      return;
    }

    // 1. ПЕРЕВІРКА: Чи існує вже акаунт з таким номером телефону
    const existingUser = users.find(u => u.phone === phone);
    if (existingUser) {
      alert(currentLang === 'UA' 
        ? 'Користувач із цим номером телефону вже зареєстрований! Увійдіть в акаунт.' 
        : 'User with this phone number already exists!');
      return;
    }

    // 2. ПЕРЕВІРКА ДЛЯ АУТСОРСУ: Чи є номер у списку доступу від Менеджера
    if (role === 'outsource') {
      const allowedPhones = getAllowedOutsourcePhones();
      if (!allowedPhones.includes(phone)) {
        alert(currentLang === 'UA' 
          ? 'Вашого номера немає в списку дозволених для аутсорсу. Зверніться до менеджера для допуску.' 
          : 'Your phone is not in the allowed list for outsource. Contact the manager.');
        return;
      }
    }

    // Збереження нового користувача
    const newUser = {
      role: role,
      phone: phone,
      password: password,
      firstName: firstName,
      lastName: lastName,
      warehouse: role === 'admin' ? warehouse : null,
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);

    // Автоматична авторизація після реєстрації
    localStorage.setItem('currentUser', JSON.stringify({ ...newUser, isAuthenticated: true }));

    alert(currentLang === 'UA' ? 'Реєстрація успішна!' : 'Registration successful!');
    window.location.href = ROLE_PAGES[role];
    return;
  }

  // ----------------------------------------
  // РЕЖИМ ВХОДУ (LOGIN)
  // ----------------------------------------
  const user = users.find(u => u.phone === phone && u.password === password && u.role === role);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify({ ...user, isAuthenticated: true }));
    window.location.href = ROLE_PAGES[role];
  } else {
    alert(currentLang === 'UA' 
      ? 'Невірний номер телефону, пароль або роль! Спробуйте ще раз або зареєструйтесь.' 
      : 'Invalid credentials or role!');
  }
}

// ==========================================
// 4. ТЕМА, МОВА ТА ВКЛАДКИ
// ==========================================

function switchAuthTab(tab) {
  currentAuthTab = tab;

  const btnLogin = document.getElementById('tabLogin');
  const btnRegister = document.getElementById('tabRegister');
  const nameFieldsBox = document.getElementById('nameFieldsBox');
  const btnSubmit = document.getElementById('btnSubmitAuth');
  const authTitle = document.getElementById('authTitle');

  const t = translations[currentLang];

  if (tab === 'login') {
    btnLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl bg-indigo-600/30 text-indigo-300 transition duration-200";
    btnRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition duration-200";
    if (nameFieldsBox) nameFieldsBox.classList.add('hidden');
    if (authTitle) authTitle.innerText = t.titleLogin;
    if (btnSubmit) btnSubmit.innerText = t.btnSubmitLogin;
  } else {
    btnRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl bg-indigo-600/30 text-indigo-300 transition duration-200";
    btnLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition duration-200";
    if (nameFieldsBox) nameFieldsBox.classList.remove('hidden');
    if (authTitle) authTitle.innerText = t.titleRegister;
    if (btnSubmit) btnSubmit.innerText = t.btnSubmitRegister;
  }

  handleRoleOrTabChange();
}

function handleRoleOrTabChange() {
  const roleSelect = document.getElementById('authRole');
  const warehouseBox = document.getElementById('warehouseSelectBox');
  const codeBox = document.getElementById('codeAccessBox');

  if (!roleSelect) return;

  const role = roleSelect.value;

  if (warehouseBox) {
    if (role === 'admin') {
      warehouseBox.classList.remove('hidden');
    } else {
      warehouseBox.classList.add('hidden');
    }
  }

  if (codeBox) {
    if (role === 'admin' || role === 'manager' || currentAuthTab === 'register') {
      codeBox.classList.remove('hidden');
    } else {
      codeBox.classList.add('hidden');
    }
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'UA' ? 'EN' : 'UA';
  document.getElementById('langLabel').innerText = currentLang;

  const t = translations[currentLang];
  document.getElementById('authSubtitle').innerText = t.subtitle;
  document.getElementById('tabLogin').innerText = t.tabLogin;
  document.getElementById('tabRegister').innerText = t.tabRegister;

  switchAuthTab(currentAuthTab);
}

function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.getElementById('themeIcon');

  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    themeIcon.className = 'fa-solid fa-sun';
  } else {
    html.classList.add('dark');
    themeIcon.className = 'fa-solid fa-moon';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleRoleOrTabChange();
});
