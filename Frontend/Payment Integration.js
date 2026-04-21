// payments.js
async function initiatePayment() {
  if (!currentUser) {
    showAuth();
    return;
  }
  
  try {
    // First create order in your system
    const orderData = await createOrderInDatabase();
    
    // Create Razorpay order
    const paymentOrder = await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({
        amount: orderData.total,
        orderId: orderData.orderId
      })
    });
    
    const options = {
      key: paymentOrder.key,
      amount: paymentOrder.order.amount,
      currency: "INR",
      name: "JOY PRO",
      description: "Premium Cap Collection",
      order_id: paymentOrder.order.id,
      handler: async function (response) {
        try {
          await apiRequest('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId
            })
          });
          
          // Payment successful
          resetCart();
          showSuccessPage(orderData);
          
        } catch (error) {
          toast('Payment verification failed');
        }
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email
      },
      theme: {
        color: "#1a1a1a"
      }
    };
    
    const razorpay = new Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    toast('Payment initiation failed');
  }
}

async function createOrderInDatabase() {
  const formData = getFormData();
  const totals = calculateTotals();
  
  return await apiRequest('/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      items: cart.map(item => ({
        productId: item.id,
        name: getProductName(item.id),
        price: getProductPrice(item.id),
        size: item.sz,
        quantity: item.q
      })),
      shipping: formData,
      payment: {
        method: payMeth,
        amount: totals.total
      }
    })
  });
}
