const axios = require('axios');
const base64 = require('base-64');

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const env = process.env.MPESA_ENV || 'sandbox';

const oauthUrl = env === 'sandbox' 
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const stkPushUrl = env === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

async function getAccessToken() {
  const auth = base64.encode(`${consumerKey}:${consumerSecret}`);

  try {
    const { data } = await axios.get(oauthUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return data.access_token;
  } catch (error) {
    throw new Error('Failed to get access token from M-Pesa: ' + error.message);
  }
}

function generateTimestamp() {
  const date = new Date();
  return date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function generatePassword() {
  const timestamp = generateTimestamp();
  const str = shortcode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
}

/**
 * Initiates an STK Push payment
 * @param {string} phoneNumber - Phone number in format 2547xxxxxxxx
 * @param {number} amount - Amount to pay
 * @param {string} accountReference - Account reference for transaction
 * @param {string} transactionDesc - Description
 */
async function stkPush(phoneNumber, amount, accountReference, transactionDesc) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword();

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  try {
    const response = await axios.post(stkPushUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('STK Push failed: ' + (error.response?.data?.errorMessage || error.message));
  }
}

module.exports = { stkPush };
