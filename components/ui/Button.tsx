'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'px-7 py-[14px] rounded-full font-sans text-sm font-medium cursor-pointer transition-all border';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-bg border-transparent hover:shadow-[0_0_0_3px_var(--tw-shadow-color),0_0_0_4px_#e8b84a] shadow-accent-soft',
  ghost:
    'bg-transparent border-line text-ink-2 hover:border-ink hover:text-ink',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          base,
          variants[variant],
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          className,
        ].join(' ')}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
