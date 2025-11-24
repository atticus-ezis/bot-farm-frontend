import '@/styles/globals.css';
import 'flowbite/dist/flowbite.css';
import { Flowbite } from 'flowbite-react';

export default function App({ Component, pageProps }) {
  return (
    <Flowbite>
      <Component {...pageProps} />
    </Flowbite>
  );
}
