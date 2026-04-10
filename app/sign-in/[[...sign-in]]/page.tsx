import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
      <SignIn path="/sign-in" />
    </div>
  );
}