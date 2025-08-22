// Hardcoded credentials for subdomain-based authentication
export const AUTH_CREDENTIALS: Record<string, { email: string; password: string; userData?: any }> = {
  'demo': {
    email: 'teck@site.com',
    password: '1234',
    userData: {
      hasCard: false,
      cardDetails: null,
      isCardPending: false
    }
  },
  'user1': {
    email: 'user1@pepuns.xyz',
    password: 'user123',
    userData: {
      hasCard: true,
      cardDetails: {
        number: '4532 1234 5678 9012',
        expiry: '12/28',
        cvv: '123',
        holderName: 'John Doe',
        billingAddress: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        }
      },
      isCardPending: false
    }
  },
  'test': {
    email: 'test@pepuns.xyz',
    password: 'test123',
    userData: {
      hasCard: false,
      cardDetails: null,
      isCardPending: true
    }
  }
};

export function getCurrentSubdomain(): string {
  if (typeof window === 'undefined') return 'demo';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'demo';
  }
  
  // Extract subdomain from user.card.pepuns.xyz
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return 'demo';
}

export function getCredentialsForSubdomain() {
  const subdomain = getCurrentSubdomain();
  return AUTH_CREDENTIALS[subdomain] || AUTH_CREDENTIALS['demo'];
}

export function validateCredentials(email: string, password: string): boolean {
  const creds = getCredentialsForSubdomain();
  return creds.email === email && creds.password === password;
}