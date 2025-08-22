// Hardcoded credentials for subdomain-based authentication
export const AUTH_CREDENTIALS: Record<string, { email: string; password: string; userData?: any }> = {
  'demo': {
    email: 'thehorsefinance@gmail.com',
    password: '12345678',
    userData: {
      hasCard: true,
      cardDetails: {
        number: '123 586 697',
        expiry: '12/29',
        cvv: '103',
        holderName: 'Card Holder',
        billingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      isCardPending: false
    }
  }
};

export function getCurrentSubdomain(): string {
  if (typeof window === 'undefined') return 'demo';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For local development or main domain
  if (hostname === 'localhost' || hostname === '127.0.0.1' || parts.length < 3) {
    return 'demo';
  }
  
  // Extract subdomain from user.card.pepuns.xyz
  return parts[0];
}

export function getCredentialsForSubdomain() {
  const subdomain = getCurrentSubdomain();
  return AUTH_CREDENTIALS[subdomain] || AUTH_CREDENTIALS['demo'];
}

export function validateCredentials(email: string, password: string): boolean {
  const creds = getCredentialsForSubdomain();
  return creds.email === email && creds.password === password;
}

export function isCardMock(cardDetails: any): boolean {
  if (!cardDetails) return true;
  
  // Check if card details are all zeros/mock data
  return cardDetails.number === '0000 0000 0000 0000';
}
