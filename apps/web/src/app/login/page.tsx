import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      body="Continue shaping the professional evidence behind your pages, versions, and resumes."
    >
      <form className="space-y-4">
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" placeholder="Password" />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm font-semibold">
        <Link href="/forgot-password" className="text-[var(--ft-blue-500)]">
          Forgot password?
        </Link>
        <Link href="/register">Create account</Link>
      </div>
    </AuthShell>
  );
}
