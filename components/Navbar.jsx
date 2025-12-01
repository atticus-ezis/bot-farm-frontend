import Link from "next/link";
import { useRouter } from "next/router";
import { Navbar as FlowbiteNavbar } from "flowbite-react";

export default function Navbar() {
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/bot-event-list", label: "Bot Events" },
    { href: "/ip-list", label: "IP Addresses" },
    { href: "/path-list", label: "Paths" },
    { href: "/attack-list", label: "Attacks" },
  ];

  return (
    <FlowbiteNavbar fluid rounded className="border-b">
      <FlowbiteNavbar.Brand href="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Bot Analytics</span>
      </FlowbiteNavbar.Brand>
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Collapse>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              router.pathname === link.href
                ? "text-blue-700 dark:text-blue-500"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            } block py-2 px-3 rounded md:p-0`}
          >
            {link.label}
          </Link>
        ))}
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
}
