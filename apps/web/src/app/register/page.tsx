import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your FolioTree"
      body="Start with your central profile. Publish pages and resumes when your proof is ready."
    >
      <form className="space-y-4">
        <Field label="Name" name="name" placeholder="Alex Morgan" />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" placeholder="Create a password" />
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-[rgba(15,17,21,0.62)]">
        Already have an account? <Link href="/login" className="text-[var(--ft-blue-500)]">Login</Link>
      </p>
    </AuthShell>
  );
}
