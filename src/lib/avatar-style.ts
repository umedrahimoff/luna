export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function avatarBackgroundFromEmail(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i += 1) {
    h = email.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  return `oklch(0.52 0.14 ${hue})`;
}
