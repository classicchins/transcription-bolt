import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '@/lib/supabase-utils';
import { FormError } from './FormError';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onModeChange: (mode: 'login') => void;
}

export function ForgotPasswordForm({ onSuccess, onModeChange }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: ForgotFormData) => {
    setError(null);
    const { error } = await resetPassword(data.email);
    if (error) {
      setError(error.message);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="name@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {error && <FormError message={error} />}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          'Reset password'
        )}
      </Button>

      <Button
        type="button"
        variant="link"
        onClick={() => onModeChange('login')}
      >
        Back to sign in
      </Button>
    </form>
  );
}