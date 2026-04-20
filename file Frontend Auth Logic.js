// auth.js
let currentUser = null;
let authToken = localStorage.getItem('jp_auth_token');

// API Helper
async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Login Handler
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('jp_auth_token', authToken);
    
    closeAuth();
    updateAuthUI();
    toast('Welcome back! ✓');
    
  } catch (error) {
    toast(error.message);
  }
}

// Signup Handler
async function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;
  
  try {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password })
    });
    
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('jp_auth_token', authToken);
    
    closeAuth();
    updateAuthUI();
    toast('Account created successfully! ✓');
    
  } catch (error) {
    toast(error.message);
  }
}

// Update UI based on auth state
function updateAuthUI() {
  const authBtn = document.getElementById('authButton');
  if (currentUser) {
    authBtn.innerHTML = `
      <div class="user-dropdown">
        <span>${currentUser.name}</span>
        <div class="dropdown-menu">
          <a href="#" onclick="goToDashboard()">My Orders</a>
          <a href="#" onclick="logout()">Logout</a>
        </div>
      </div>
    `;
  } else {
    authBtn.innerHTML = `<button onclick="showAuth()">Sign In</button>`;
  }
}
