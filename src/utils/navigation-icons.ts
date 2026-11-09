import {
  Accessibility, ArrowLeft, Award, BarChart3, Bell, BookOpen, Briefcase,
  BriefcaseBusiness, Building2, Calculator, Calendar, ChartColumn,
  ClipboardList, Clock, ContactRound, CreditCard, FileSignature, FileText,
  Files, GraduationCap, Headphones, Heart, History, Home, IdCard, Image,
  Images, Languages, LayoutDashboard, LayoutGrid, LifeBuoy, LockKeyhole,
  LogOut, Mail, MessageCircle, Package, Plug, Radar, Receipt, ScrollText,
  Search, Settings, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles,
  User, UserRoundSearch, Users, UsersRound, Wallet, Wrench, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Accessibility, ArrowLeft, Award, BarChart3, Bell, Book: BookOpen, BookOpen,
  Briefcase, BriefcaseBusiness, Building: Building2, Building2, Calculator,
  Calendar, ChartColumn, ClipboardList, Clock, ContactRound, CreditCard,
  FileSignature, FileText, Files, GraduationCap, Headphones,
  Headset: Headphones, Heart, History, Home, IdCard, Image, Images, Languages,
  Layout: LayoutGrid, LayoutDashboard, LayoutGrid, LifeBuoy,
  Lock: LockKeyhole, LockKeyhole, LogOut, Mail, MessageCircle, Package, Plug,
  Radar, Receipt, ScrollText, Search, Settings, ShieldCheck, ShoppingCart,
  Sliders: SlidersHorizontal, SlidersHorizontal, Sparkles, Tool: Wrench, User,
  UserRoundSearch, Users, UsersRound, Wallet, Wrench,
};

function normalizeIconName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

const NORMALIZED_ICONS = new Map(
  Object.entries(ICONS).map(([name, icon]) => [normalizeIconName(name), icon]),
);

/** Resolve somente ícones Lucide previamente permitidos pelo sistema. */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LayoutGrid;
  return NORMALIZED_ICONS.get(normalizeIconName(name)) ?? LayoutGrid;
}
