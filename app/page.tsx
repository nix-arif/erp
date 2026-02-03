import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="absolute top-0 right-0 flex items-center justify-end p-4">
        <ModeSwitcher />
      </header>
      <div className="flex h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="font-bold text-4xl">Aksara</h1>

        <p className="text-lg">Aksara</p>

        <div className="flex gap-2">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Signup</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
