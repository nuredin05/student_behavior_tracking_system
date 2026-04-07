/**
 * SMS Simulation Service for Amana Model School
 * In development: Logs messages to the backend terminal.
 * In production: Can be swapped for Twilio/Africa's Talking.
 */

const sendSMS = async (phone, message) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // console.log('\n' + '='.repeat(50));
  // console.log('📱 [SMS GATEWAY] DISPATCHED');
  // console.log(`📡 To: ${phone}`);
  // console.log(`💬 Message: ${message}`);
  // console.log('='.repeat(50) + '\n');

  return { success: true, messageId: Math.random().toString(36).substring(7) };
};

module.exports = { sendSMS };
