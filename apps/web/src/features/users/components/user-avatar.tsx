import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: "default" | "sm" | "lg";
};

export function UserAvatar({ name, src, size }: UserAvatarProps) {
  return (
    <Avatar size={size} title={name}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
