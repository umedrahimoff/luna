"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & {
  action: NonNullable<FormHTMLAttributes<HTMLFormElement>["action"]>;
  confirmMessage: string;
  children: ReactNode;
};

/** Intercepts submit; runs browser confirm before server action / POST. */
export function ConfirmForm({ action, confirmMessage, children, ...rest }: Props) {
  return (
    <form
      {...rest}
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
