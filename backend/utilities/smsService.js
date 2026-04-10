/**
 * SMS Service for Amana Model School
 * Uses Twilio for real-time OTP delivery with a simulation fallback for development.
 */
const twilio = require('twilio');

const sendSMS = async (phone, message) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  // Format phone number to E.164 (Twilio requirement)
  let formattedPhone = phone;
  if (phone.startsWith('09') || phone.startsWith('07')) {
    formattedPhone = '+251' + phone.slice(1);
  } else if (!phone.startsWith('+')) {
    // If it doesn't start with +, assume it needs one but user forgot
    // You might want to be more specific here depending on the country
  }

  // Fallback to simulation if credentials are missing
  if (!sid || !token || !from || sid === 'your_account_sid_here') {
    console.log('\n--- SMS SIMULATION (Twilio not configured) ---');
    console.log(`To: ${formattedPhone} (Original: ${phone})`);
    console.log(`Message: ${message}`);
    console.log('--------------------------------------------\n');
    return { success: true, mode: 'simulation' };
  }

  try {
    const client = twilio(sid, token);
    const response = await client.messages.create({
      body: message,
      to: formattedPhone,
      from: from,
    });

    console.log(`SMS sent successfully to ${formattedPhone}. SID: ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    // Even if Twilio fails, we log it but don't crash the auth flow 
    // to allow email fallback if configured.
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
