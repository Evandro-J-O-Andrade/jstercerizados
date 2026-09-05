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
  ArrowLeft,
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
  ArrowLeft,
};

export function resolveIcon(name: string): LucideIcon {
  return MAP[name] ?? Home;
}
