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
      isDev ? 'http://localhost:3002' : '',
      isDev ? 'ws://localhost:3002' : '',
    ].filter(Boolean)
  )
).join(' ');

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data:;
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
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
