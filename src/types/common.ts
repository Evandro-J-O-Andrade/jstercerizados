export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ContactFormData {
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  message: string;
  subject: string;
  service?: string;
}

export interface BudgetRequest {
  id: string;
  name: string;
  company: string;
  cnpj: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  whatsapp: string;
  service: string;
  posts: number;
  message: string;
  status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  createdAt: string;
}

export interface Partner {
  id: string;
  company: string;
  cnpj: string;
  responsible: string;
  phone: string;
  email: string;
  area: string;
  city: string;
  state: string;
  documentation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Supplier {
  id: string;
  company: string;
  cnpj: string;
  products: string;
  representative: string;
  phone: string;
  email: string;
  catalog: string;
  documents: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  city: string;
  experience: string;
  position: string;
  resume: string;
  resumeFileName?: string;
  availability: string;
  courses: string;
  status: 'received' | 'review' | 'interview' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  benefits: string[];
  image: string;
  icon: string;
  category: 'rh' | 'facilities' | 'terceirizacao' | 'candidato';
}

export interface Vaga {
  id: string;
  slug: string;
  titulo: string;
  empresa?: string;
  cidade?: string;
  estado?: string;
  tipoContrato?:
    'CLT' | 'ESTAGIO' | 'TEMPORARIO' | 'FREELA' | 'TERCEIRIZADO' | 'CD';
  nivel?: 'ESTAGIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'MASTER' | 'LIDERANCA';
  salarioMin?: number;
  salarioMax?: number;
  modalidade?: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  beneficios?: string[];
  requisitos?: string;
  descricao?: string;
  responsibilities?: string;
  area?: string;
  workload?: string;
  workSchedule?: string;
  vagas?: number;
  status: 'BORRAR' | 'ATIVA' | 'ARQUIVADA' | 'CONTRATADA';
  dataPublicacao: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  text: string;
  avatar: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface JobCreatePayload {
  company: {
    name: string;
    cnpj?: string;
    contactName: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  job: {
    title: string;
    quantity: number;
    city: string;
    state: string;
    contractType: string;
    salary?: string;
    benefits?: string;
    schedule?: string;
    description: string;
    requirements?: string;
    education?: string;
  };
  source: 'website';
  consentLgpd: boolean;
}
