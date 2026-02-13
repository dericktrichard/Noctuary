import 'server-only';
import paypal from '@paypal/checkout-server-sdk';

// PayPal Environment
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  return mode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal Client
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

// Create PayPal order
export async function createPayPalOrder(amount: number, currency: 'USD' = 'USD') {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description: 'Noctuary Poetry Commission',
      },
    ],
    application_context: {
      brand_name: 'Noctuary',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    },
  });

  try {
    const order = await client().execute(request);
    return {
      id: order.result.id,
      status: order.result.status,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw new Error('Failed to create PayPal order');
  }
}

// Capture PayPal payment
export async function capturePayPalPayment(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    return {
      id: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer,
      amount: capture.result.purchase_units[0].payments.captures[0].amount,
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw new Error('Failed to capture PayPal payment');
  }
}

// Get PayPal order details
export async function getPayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersGetRequest(orderId);

  try {
    const order = await client().execute(request);
    return order.result;
  } catch (error) {
    console.error('PayPal get order error:', error);
    throw new Error('Failed to get PayPal order');
  }
}