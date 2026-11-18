import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

import { usePageTitle } from "@/hooks/use-page-title";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type Schema = z.infer<typeof schema>;

export function SignUpPage() {
  usePageTitle("Create account");
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // someone who is already signed in has no use for this page
  if (session) return <Navigate to="/settings" replace />;

  async function onSubmit(data: Schema) {
    const { error } = await authClient.signUp.email(data);
    if (error) {
      toast.error(error.message ?? "Sign up failed");
      return;
    }
    toast.success("Account created");
    void navigate("/settings", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>Create your account</h1>
          </CardTitle>
          <CardDescription>Start managing projects with AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
