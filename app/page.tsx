import HomeContent from "../components/home/Home";
import { validateSessionToken } from "@/libs/token-gate/sessionTokens";
import InvalidAccessPage from "@/components/InvalidAccessPage";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;

  const rawSessionToken = sp?.["session-token"];
  const sessionToken = typeof rawSessionToken === "string" && rawSessionToken.length >= 10 ? rawSessionToken : null;

  const minimumLoadingDelay = new Promise<void>((resolve) => setTimeout(resolve, 2000));

  if (!sessionToken) {
    await minimumLoadingDelay;
    return <InvalidAccessPage />;
  }

  const [_, isValid] = await Promise.all([
    minimumLoadingDelay,
    validateSessionToken(sessionToken),
  ]);
  if (!isValid) {
    return <InvalidAccessPage />;
  }

  return <HomeContent sessionToken={sessionToken} />;
}
