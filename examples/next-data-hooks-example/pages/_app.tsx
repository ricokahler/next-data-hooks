import { AppProps } from 'next/app';
import { NextDataHooksProvider } from 'next-data-hooks';

function MyApp({ Component, pageProps }: AppProps) {
  const { children, ...rest } = pageProps;

  return (
    <NextDataHooksProvider {...rest}>
      <Component {...rest}>{children}</Component>
    </NextDataHooksProvider>
  );
}

export default MyApp;
