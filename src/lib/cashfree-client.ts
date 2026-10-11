declare global {
  interface Window {
    Cashfree?: any;
  }
}

/**
 * Loads the Cashfree PG v3 JavaScript SDK
 */
export async function loadCashfreeScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }

    if (window.Cashfree) {
      return resolve(window.Cashfree);
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK failed to initialize'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree script from CDN'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initializes and triggers Cashfree Checkout modal
 */
export async function initiateCashfreeCheckout(paymentSessionId: string, isProduction = true) {
  try {
    const CashfreeClass = await loadCashfreeScript();
    const cashfree = new CashfreeClass({
      mode: isProduction ? 'production' : 'sandbox',
    });

    return cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_modal', // Opens sleek in-page modal dropin!
    });
  } catch (error) {
    console.error('Error initiating Cashfree dropin checkout:', error);
    throw error;
  }
}
