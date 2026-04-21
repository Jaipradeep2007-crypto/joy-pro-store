// dashboard.js
function showDashboard() {
  if (!currentUser) {
    showAuth();
    return;
  }
  
  goTo('dashboard');
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    // Load user profile
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Load orders
    await loadOrders();
    
  } catch (error) {
    toast('Failed to load dashboard data');
  }
}

async function loadOrders() {
  try {
    const orders = await apiRequest('/orders/my-orders');
    
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No orders yet</p>
          <button onclick="goTo('home')" class="btn-primary">Start Shopping</button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <strong>Order ${order.orderId}</strong>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="order-status status-${order.status}">${order.status.toUpperCase()}</div>
        </div>
        
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <img src="${getProductImage(item.productId)}" alt="${item.name}">
              <div>
                <h4>${item.name}</h4>
                <p>Size: ${item.size} • Qty: ${item.quantity}</p>
              </div>
              <div class="item-price">₹${item.price * item.quantity}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="order-footer">
          <div class="order-total">Total: ₹${order.payment.amount}</div>
          <div class="order-payment">
            <span class="payment-status status-${order.payment.status}">
              ${order.payment.status.toUpperCase()}
            </span>
            <span class="payment-method">${order.payment.method.toUpperCase()}</span>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    document.getElementById('ordersContainer').innerHTML = 
      '<p>Failed to load orders</p>';
  }
}

function showDashboardTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => 
    tab.classList.remove('active')
  );
  
  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(nav => 
    nav.classList.remove('active')
  );
  event.target.classList.add('active');
}
