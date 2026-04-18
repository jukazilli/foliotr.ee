import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      body="Enter your email and continue with the managed authentication flow."
    >
      <form className="space-y-4">
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold">
        <Link href="/login" className="text-[var(--ft-blue-500)]">Back to login</Link>
      </p>
    </AuthShell>
  );
}
