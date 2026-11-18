import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

import { errorMessage } from "@/lib/error-message";

const schema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
});
type Values = z.infer<typeof schema>;

type MemberInviteFormProps = {
  /** Resolves with the person added; rejects with the reason it failed. */
  onInvite: (email: string) => Promise<{ name: string }>;
};

export function MemberInviteForm({ onInvite }: MemberInviteFormProps) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function submit({ email }: Values) {
    try {
      const member = await onInvite(email);
      toast.success(`${member.name} added`);
      form.reset();
    } catch (error) {
      toast.error(errorMessage(error, "Could not add that person. Try again."));
    }
  }

  return (
    <form
      onSubmit={(event) => void form.handleSubmit(submit)(event)}
      noValidate
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Invite by email</FieldLabel>
            <div className="flex gap-2">
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="teammate@example.com"
                autoComplete="off"
                aria-invalid={fieldState.invalid}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <UserPlus /> Invite
              </Button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
