# Architecture

## Overview

JSEmpregos uses a Feature-Based Architecture with Clean Architecture principles.
The codebase is organized so that business logic is decoupled from UI and infrastructure.

---

## Directory Structure

```text
src/
├── app/              # Application-level config, providers, store
├── assets/           # Static assets (images, fonts, icons)
├── components/       # Shared UI components
│   ├── common/       # Common reusable components
│   ├── layout/       # Layout components (Navbar, Footer, Sidebar)
│   ├── navigation/   # Navigation-specific components
│   ├── ui/           # Basic UI primitives (Button, Input, Card, etc.)
│   └── sections/     # Section-level components
├── contexts/         # React Contexts
├── features/         # Feature-based modules
│   ├── auth/         # Authentication
│   ├── dashboard/    # Admin dashboard
│   ├── home/         # Home page
│   ├── services/     # Services
│   ├── clients/      # Client budget requests
│   ├── partners/     # Partner registrations
│   ├── suppliers/    # Supplier registrations
│   ├── careers/      # Job applications
│   ├── contact/      # Contact form
│   └── layouts/      # Page layouts
├── hooks/            # Custom React hooks
├── lib/              # External service configurations
├── pages/            # Route pages
├── routes/           # Route definitions
├── services/         # Service layer
│   ├── mock/         # Mock implementations
│   ├── api/          # Real API clients (future)
│   └── integrations/ # Third-party integrations (future)
├── styles/           # Global CSS and styles
├── types/            # Shared TypeScript types
└── utils/            # Utility functions
```

---

## Layers

### Presentation Layer (components/, pages/, features/)

- Components receive data via props or context.
- No direct API calls inside components.
- No business logic in components.
- Use composition to pass behavior.

### Domain Layer (features/*/, types/)

- Feature modules own their business entities.
- Each feature has its own types, hooks, and sub-components.
- Types are defined as interfaces.

### Service Layer (services/)

- Never access data directly in components.
- Always create a service layer for data operations.
- Current implementation uses `mock/` for simulated data.
- Future: replace `mock/` with `api/` using the same interface.

---

## Patterns

### Service Abstraction

All data operations go through service interfaces. The current implementation
uses local storage as a mock. When Supabase is integrated, only the service
implementation changes, not the components.

### Form Isolation

Every form uses React Hook Form + Zod for validation. Form schemas are defined
next to the component. Service calls are decoupled.

### Atomic Design

Components follow atomic design principles:

- Atoms: Button, Input, Label, Icon
- Molecules: InputGroup, FormField
- Organisms: Form, Card, Section
