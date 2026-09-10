import type { ButtonHTMLAttributes } from "react";
import { GoogleLogo } from "@/components/icons/google-logo";

type GoogleSignInButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

// "Sign in with Google" neutral/light button per Google Identity branding
// guidelines: white surface, #747775 border, #1F1F1F text, Roboto/Google Sans
// typography, and the untouched multicolor "G" mark at its specified size
// and clear space. https://developers.google.com/identity/branding-guidelines
export function GoogleSignInButton({
  className = "",
  type = "button",
  children,
  ...props
}: GoogleSignInButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[4px] border border-[#747775] bg-white px-3 py-2 font-['Roboto','Google_Sans',Arial,sans-serif] text-sm font-medium tracking-[0.25px] text-[#1f1f1f] transition-colors hover:bg-[#f8f9fa] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vac-orange disabled:cursor-not-allowed disabled:bg-white disabled:text-[#1f1f1f]/60 ${className}`.trim()}
      {...props}
    >
      <GoogleLogo className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </button>
  );
}
