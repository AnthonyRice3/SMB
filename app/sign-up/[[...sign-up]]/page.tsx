import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
      <SignUp />
    </div>
  );
}