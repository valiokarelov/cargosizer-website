import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { pageview } from "../lib/gtag";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => pageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);

    // initial page load
    pageview(window.location.pathname + window.location.search);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
