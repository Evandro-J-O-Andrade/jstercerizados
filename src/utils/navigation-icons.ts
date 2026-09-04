import {
  Home,
  Briefcase,
  FileText,
  User,
  Heart,
  Bell,
  Settings,
  LogOut,
  Mail,
  MessageCircle,
  Accessibility,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  Home,
  Briefcase,
  FileText,
  User,
  Heart,
  Bell,
  Settings,
  LogOut,
  Mail,
  MessageCircle,
  Accessibility,
  LifeBuoy,
};

export function resolveIcon(name: string): LucideIcon {
  return MAP[name] ?? Home;
}
