import "@/styles/globals.css";
import "flowbite/dist/flowbite.css";
import { Flowbite } from "flowbite-react";
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <Flowbite>
      <Navbar />
      <Component {...pageProps} />
    </Flowbite>
  );
}
