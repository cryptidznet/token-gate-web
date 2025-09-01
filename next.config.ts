import { env } from './env';

const isDev = env.NODE_ENV === 'development';

const originFromEnv = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

const apiOrigin = originFromEnv(env.NEXT_PUBLIC_API_BASE_URL);
const solanaRpcOrigin = originFromEnv(env.NEXT_PUBLIC_SOLANA_RPC_URL);

const connectSrc = Array.from(
  new Set(
    [
      "'self'",
      apiOrigin,
      solanaRpcOrigin,
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
        ],
      },
    ];
  },
};

export default nextConfig;
