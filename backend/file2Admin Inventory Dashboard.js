// Admin inventory management
async function loadInventory() {
  try {
    const inventory = await apiRequest('/api/inventory');
    
    document.getElementById('inventoryGrid').innerHTML = inventory.map(item => `
      <div class="inventory-card ${getStockStatus(item)}">
        <div class="product-info">
          <h4>${item.productId}</h4>
          <span class="stock-status">${getStockStatus(item)}</span>
        </div>
        
        <div class="size-grid">
          ${Object.entries(item.sizes).map(([size, stock]) => `
            <div class="size-item ${stock <= item.lowStockThreshold ? 'low-stock' : ''}">
              <label>${size}</label>
              <input type="number" value="${stock}" 
                     onchange="updateStock('${item.productId}', '${size}', this.value)"
                     min="0">
              ${stock <= item.lowStockThreshold ? '<span class="low-badge">LOW</span>' : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="inventory-actions">
          <button onclick="bulkUpdateStock('${item.productId}')" class="btn-primary">
            Bulk Update
          </button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Failed to load inventory:', error);
  }
}

function getStockStatus(item) {
  const totalStock = Object.values(item.sizes).reduce((sum, stock) => sum + stock, 0);
  if (totalStock === 0) return 'out-of-stock';
  if (totalStock <= item.lowStockThreshold * 2) return 'low-stock';
  return 'in-stock';
}

async function updateStock(productId, size, newStock) {
  try {
    await apiRequest(`/api/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        sizes: { [size]: parseInt(newStock) }
      })
    });
    
    toast('Stock updated successfully');
  } catch (error) {
    toast('Failed to update stock');
  }
}
