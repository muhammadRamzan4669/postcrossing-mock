"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row">
      {pathname !== "/login" && <Link href="/login">Login</Link>}
      {pathname !== "/signup" && <Link href="/signup">Signup</Link>}
    </nav>
  );
};

export default NavBar;
