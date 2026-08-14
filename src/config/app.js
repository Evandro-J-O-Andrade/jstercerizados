import { COMPANY } from './company';
export const APP_CONFIG = {
    name: COMPANY.name,
    fullName: COMPANY.tradingName,
    description: COMPANY.description,
    version: '1.0.0',
    url: 'https://jsterceirizados.com.br',
    locale: 'pt-BR',
};
export const APP_ENV = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '+5511968380592',
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID ?? '',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
    appUrl: import.meta.env.VITE_APP_URL ?? 'http://localhost:3000',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
};
