import { SessionProvider } from "next-auth/react";

export default function PresencaLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
