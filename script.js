const products = [
  { id: 1, name: '輕奢落地燈', category: '家居生活', price: 1890, oldPrice: 2490, rating: 4.8, tone: 'warm' },
  { id: 2, name: '智慧音箱 Pro', category: '3C 數位', price: 2590, oldPrice: 3290, rating: 4.9, tone: 'dark' },
  { id: 3, name: '經典皮革包', category: '時尚穿搭', price: 2990, oldPrice: 3990, rating: 4.7, tone: 'pink' },
  { id: 4, name: '保濕修護精華', category: '美妝保養', price: 890, oldPrice: 1290, rating: 4.8, tone: 'green' },
  { id: 5, name: '多功能椅', category: '家居生活', price: 2490, oldPrice: 3290, rating: 4.6, tone: 'warm' },
  { id: 6, name: '無線藍牙耳機', category: '3C 數位', price: 2190, oldPrice: 2890, rating: 4.9, tone: 'dark' },
  { id: 7, name: '超柔休閒外套', category: '時尚穿搭', price: 1690, oldPrice: 2290, rating: 4.8, tone: 'pink' },
  { id: 8, name: '亮白潔顏露', category: '美妝保養', price: 760, oldPrice: 990, rating: 4.7, tone: 'green' }
];

const cart = [];

const productGrid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const totalEl = document.getElementById('total');
const toast = document.getElementById('toast');
const cartPanel = document.getElementById('cart-panel');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const closeCart = document.getElementById('close-cart');
const registerTrigger = document.getElementById('register-trigger');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

const USERS_KEY = 'novacart-users';
const SESSION_KEY = 'novacart-session';

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function updateAuthButton() {
  const currentUser = getCurrentUser();

  if (currentUser) {
    registerTrigger.textContent = '👤';
    registerTrigger.setAttribute('aria-label', `會員中心：${currentUser.name}`);
    registerTrigger.title = `歡迎，${currentUser.name}`;
    return;
  }

  registerTrigger.textContent = '✚';
  registerTrigger.setAttribute('aria-label', '會員註冊');
  registerTrigger.title = '會員註冊';
}

function showAuthMessage(message, type = 'error') {
  authMessage.textContent = message;
  authMessage.classList.remove('error', 'success');
  authMessage.classList.add(type);
}

function openAuthModal() {
  authModal.classList.add('open');
  authModal.setAttribute('aria-hidden', 'false');
}

function closeAuthModal() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  registerForm.reset();
  showAuthMessage('');
}

registerTrigger.addEventListener('click', openAuthModal);
closeAuth.addEventListener('click', closeAuthModal);

authModal.addEventListener('click', (event) => {
  if (event.target === authModal) {
    closeAuthModal();
  }
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!name || !email || !password || !confirmPassword) {
    showAuthMessage('請填寫完整的註冊資料。', 'error');
    return;
  }

  if (name.length < 2) {
    showAuthMessage('姓名至少需要 2 個字元。', 'error');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showAuthMessage('請輸入有效的電子郵件地址。', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthMessage('密碼長度至少為 6 碼。', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAuthMessage('兩次輸入的密碼不一致。', 'error');
    return;
  }

  const users = getRegisteredUsers();
  const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    showAuthMessage('此電子郵件已經註冊過，請使用其他信箱。', 'error');
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    password,
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });

  closeAuthModal();
  updateAuthButton();
  showToast(`${newUser.name} 註冊成功！`);
});

function renderProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = products.filter((product) => {
    const matchKeyword = product.name.toLowerCase().includes(keyword);
    const matchCategory = category === 'all' || product.category === category;
    return matchKeyword && matchCategory;
  });

  if (!filtered.length) {
    productGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 34px; text-align: center; color: var(--muted);">
        沒有符合條件的商品，請嘗試其他關鍵字。
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image" data-tone="${product.tone}"></div>
          <div class="product-body">
            <div class="product-meta">
              <span>${product.category}</span>
              <span class="product-rating">★ ${product.rating}</span>
            </div>
            <h3>${product.name}</h3>
            <div class="product-bottom">
              <div class="price-wrap">
                <span class="price">NT$ ${product.price.toLocaleString()}</span>
                <span class="old-price">NT$ ${product.oldPrice.toLocaleString()}</span>
              </div>
              <button class="add-btn" data-id="${product.id}">加入購物車</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  productGrid.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.id)));
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} 已加入購物車`);
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `
      <div style="padding: 18px; background: #f8f9ff; border: 1px dashed var(--line); border-radius: 16px; color: var(--muted); text-align: center;">
        購物車目前是空的。
      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item">
            <div class="cart-thumb" style="background: linear-gradient(135deg, ${item.tone === 'warm' ? '#ffe4d0' : item.tone === 'dark' ? '#dfe6ff' : item.tone === 'green' ? '#dff9ea' : '#ffe4ef'}, #cfcfff);"></div>
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span>NT$ ${item.price.toLocaleString()}</span>
              <div class="qty-control">
                <button data-action="decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button data-action="increase" data-id="${item.id}">+</button>
              </div>
            </div>
            <div class="cart-actions">
              <strong>NT$ ${(item.price * item.quantity).toLocaleString()}</strong>
              <button class="remove-item" data-action="remove" data-id="${item.id}">移除</button>
            </div>
          </div>
        `
      )
      .join('');
  }

  cartItems.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => updateCartQuantity(Number(button.dataset.id), button.dataset.action));
  });

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subTotal > 0 ? (subTotal >= 2000 ? 0 : 120) : 0;
  const total = subTotal + shipping;

  subtotalEl.textContent = `NT$ ${subTotal.toLocaleString()}`;
  shippingEl.textContent = `NT$ ${shipping.toLocaleString()}`;
  totalEl.textContent = `NT$ ${total.toLocaleString()}`;
}

function updateCartQuantity(productId, action) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  } else if (action === 'decrease') {
    item.quantity -= 1;
  } else if (action === 'remove') {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  if (item && item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }

  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 1800);
}

const cartButton = document.querySelector('.cart-btn');
cartButton.addEventListener('click', () => {
  cartPanel.classList.add('open');
});

closeCart.addEventListener('click', () => {
  cartPanel.classList.remove('open');
});

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);

renderProducts();
renderCart();
