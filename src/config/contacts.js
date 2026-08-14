export const CONTACTS = {
    phone: '(11) 96838-0592',
    email: 'contato@jsterceirizados.com.br',
    whatsapp: '5511968380592',
    address: 'São Paulo, SP — Brasil',
    businessHours: {
        weekday: 'Segunda a Sexta, 08h–18h',
        saturday: 'Sábado, 08h às 12h',
        sunday: 'Domingo — Fechado',
    },
};
export function getWhatsAppUrl(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
export function getWhatsAppMessage(fields) {
    const lines = Object.entries(fields)
        .filter(([, value]) => value)
        .map(([key, value]) => `*${key}:* ${value}`);
    return lines.join('\n');
}
