import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-background">
      {/* Subtle ambient background glow */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] blur-[120px] rounded-full" 
        aria-hidden="true" 
      />

      <div className="w-full max-w-md relative z-10">
        <LoginForm />
      </div>
    </main>
  );
}
