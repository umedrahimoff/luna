/** Split stored full name into first / last for profile forms. */
export function splitDisplayName(name: string): {
  firstName: string;
  lastName: string;
} {
  const t = name.trim();
  const i = t.search(/\s/);
  if (i === -1) {
    return { firstName: t, lastName: "" };
  }
  return {
    firstName: t.slice(0, i).trim(),
    lastName: t.slice(i).trim(),
  };
}

export function joinDisplayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
