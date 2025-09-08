import { env } from './env';

const isDev = env.NODE_ENV === 'development';

const originFromEnv = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const websocketOriginFromHttpOrigin = (origin: string): string => {
  try {
    if (!origin) return '';
    const url = new URL(origin);
    if (url.protocol === 'http:') {
      url.protocol = 'ws:';
    } else if (url.protocol === 'https:') {
      url.protocol = 'wss:';
    } else {
      return origin;
    }
    return url.origin;
  } catch {
    return '';
  }
};

const apiOrigin = originFromEnv(env.NEXT_PUBLIC_API_BASE_URL);
const solanaRpcOrigin = originFromEnv(env.NEXT_PUBLIC_SOLANA_RPC_URL);
const solanaRpcWsOrigin = websocketOriginFromHttpOrigin(solanaRpcOrigin);

const connectSrc = Array.from(
  new Set(
    [
      "'self'",
      apiOrigin,
      solanaRpcOrigin,
      solanaRpcWsOrigin,
      'https://*.phantom.app',
      'wss://*.phantom.app',
      'https://rpc.walletconnect.com',
      'https://rpc.walletconnect.org',
      'https://relay.walletconnect.com',
      'https://relay.walletconnect.org',
      'wss://relay.walletconnect.com',
      'wss://relay.walletconnect.org',
      'https://pulse.walletconnect.com',
      'https://pulse.walletconnect.org',
      'https://api.web3modal.com',
      'https://api.web3modal.org',
      'https://keys.walletconnect.com',
      'https://keys.walletconnect.org',
      'https://notify.walletconnect.com',
      'https://notify.walletconnect.org',
      'https://echo.walletconnect.com',
      'https://echo.walletconnect.org',
      'https://push.walletconnect.com',
      'https://push.walletconnect.org',
      'wss://www.walletlink.org',
      isDev ? 'http://localhost:3002' : '',
      isDev ? 'ws://localhost:3002' : '',
      isDev ? 'ws://localhost:3000' : '',
    ].filter(Boolean)
  )
).join(' ');

const frameSrc = Array.from(
  new Set(
    [
      "'self'",
      'https://connect.solflare.com',
      'https://phantom.app',
      'https://www.phantom.app',
      'https://wallet.phantom.app',
      'https://verify.walletconnect.com',
      'https://verify.walletconnect.org',
      'https://secure.walletconnect.com',
      'https://secure.walletconnect.org',
    ].filter(Boolean)
  )
).join(' ');

const imgSrc = Array.from(
  new Set(
    [
      "'self'",
      'blob:',
      'data:',
      'https://walletconnect.org',
      'https://walletconnect.com',
      'https://secure.walletconnect.com',
      'https://secure.walletconnect.org',
      'https://tokens-data.1inch.io',
      'https://tokens.1inch.io',
      'https://ipfs.io',
      'https://cdn.zerion.io',
    ].filter(Boolean)
  )
).join(' ');

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src ${imgSrc};
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src ${frameSrc};
  connect-src ${connectSrc};
  upgrade-insecure-requests;
`;

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(), // Flatten and trim
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noimageindex, noarchive, nosnippet, notranslate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
