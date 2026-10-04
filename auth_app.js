// Перенаправление по ролям
const ROLE_PAGES = {
  admin: 'admin_dashboard.html',
  manager: 'manager_dashboard.html',
  outsource: 'outsource_dashboard.html'
};

let currentAuthTab = 'login';
let currentLang = 'UA';

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

function handleAuthSubmit(event) {
  event.preventDefault();

  const role = document.getElementById('authRole').value;
  const phone = document.getElementById('authPhone').value.trim();
  const password = document.getElementById('authPassword').value;
  const warehouse = document.getElementById('authWarehouse') ? document.getElementById('authWarehouse').value : null;

  let firstName = '';
  let lastName = '';
  if (currentAuthTab === 'register') {
    firstName = document.getElementById('regFirstName').value.trim();
    lastName = document.getElementById('regLastName').value.trim();

    if (!firstName || !lastName) {
      alert(currentLang === 'UA' ? 'Будь ласка, заповніть ім\'я та прізвище!' : 'Please fill in your name!');
      return;
    }
  }

  const userData = {
    role: role,
    phone: phone,
    firstName: firstName,
    lastName: lastName,
    warehouse: role === 'admin' ? warehouse : null,
    isAuthenticated: true,
    authTime: new Date().toISOString()
  };

  localStorage.setItem('currentUser', JSON.stringify(userData));

  const redirectPage = ROLE_PAGES[role];

  if (redirectPage) {
    window.location.href = redirectPage;
  } else {
    alert('Помилка теми / ролі!');
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
