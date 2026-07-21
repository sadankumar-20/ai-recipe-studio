import { APP_NAME } from "../../constants";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-white/40 sm:flex-row">
        <p>© {new Date().getFullYear()} {APP_NAME}. Built for a portfolio demo.</p>
        <p>Powered by Groq · React · Framer Motion</p>
      </div>
    </footer>
  );
}
