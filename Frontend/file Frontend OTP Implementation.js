// Frontend OTP functions
async function sendOTP(phone) {
  try {
    await apiRequest('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    
    document.getElementById('otpPhone').textContent = phone;
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('otpForm').style.display = 'block';
    
    toast('OTP sent to your phone');
  } catch (error) {
    toast('Failed to send OTP');
  }
}

async function verifyOTP(event) {
  event.preventDefault();
  
  const phone = document.getElementById('signupPhone').value;
  const otp = document.getElementById('otpCode').value;
  
  try {
    await apiRequest('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
    
    // Complete signup after OTP verification
    await completeSignup();
    
  } catch (error) {
    toast('Invalid OTP');
  }
}
