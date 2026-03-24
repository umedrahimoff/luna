export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-5 py-3">
      {children}
    </div>
  );
}
