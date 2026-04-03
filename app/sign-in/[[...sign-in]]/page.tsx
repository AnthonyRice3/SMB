import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 flex justify-center items-start overflow-hidden">
        <div className="mt-[-100px] h-[500px] w-[700px] rounded-full bg-[#FF6B61]/[0.06] blur-[140px]" />
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            variables: {
              colorBackground: "#0d0d19",
              colorText: "#ffffff",
              colorTextSecondary: "rgba(255,255,255,0.5)",
              colorPrimary: "#FF6B61",
              colorInputBackground: "#161626",
              colorInputText: "#ffffff",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/[0.07]",
              headerTitle: "text-white font-bold tracking-tight",
              headerSubtitle: "text-white/50",
              socialButtonsBlockButton: "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
              dividerLine: "bg-white/10",
              dividerText: "text-white/30",
              formFieldLabel: "text-white/60 text-sm",
              formFieldInput: "border-white/10 focus:border-[#FF6B61]/60",
              footerActionLink: "text-[#FF6B61] hover:text-[#ff8a82]",
            },
          }}
        />
      </div>
    </div>
  );
}
