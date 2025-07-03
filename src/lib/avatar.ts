// Generate accessible colors for white text
const AVATAR_COLORS = [
  '#E11D48', // rose-600
  '#DC2626', // red-600
  '#EA580C', // orange-600
  '#D97706', // amber-600
  '#CA8A04', // yellow-600
  '#16A34A', // green-600
  '#059669', // emerald-600
  '#0891B2', // cyan-600
  '#0284C7', // sky-600
  '#2563EB', // blue-600
  '#4F46E5', // indigo-600
  '#7C3AED', // violet-600
  '#9333EA', // purple-600
  '#C026D3', // fuchsia-600
  '#DB2777', // pink-600
];

export function getAvatarColor(identifier: string): string {
  // Generate a consistent color based on the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  return (email || '?').charAt(0).toUpperCase();
}