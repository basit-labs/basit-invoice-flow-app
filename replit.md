# InvoiceFlow - Mobile Invoice Management App

## Overview
A comprehensive mobile invoice management application built with Expo (React Native) and Express backend. The app is designed to be completely free to use with all data stored locally on the device using AsyncStorage.

## Tech Stack
- **Frontend**: Expo SDK 54, React Native, Expo Router (file-based routing)
- **Backend**: Express.js (serves landing page and API, port 5000)
- **State Management**: React Context + AsyncStorage (offline-first)
- **PDF**: expo-print + expo-sharing for invoice PDF generation/sharing
- **UI**: Custom components, @expo/vector-icons (Feather, Ionicons)
- **Fonts**: Inter (400, 500, 600, 700)

## Architecture
- **Offline-first**: All data persisted in AsyncStorage, no cloud database needed
- **Context-based state**: DataProvider wraps the app, provides CRUD for all entities
- **File-based routing**: Expo Router with tabs and modal screens

## Key Features
- Dashboard with revenue stats, overdue alerts, quick actions
- Invoice CRUD with line items, tax, discounts, partial payments
- Client management with contact details and billing history
- Product/service catalog for quick invoice item selection
- Expense tracking with categories
- PDF invoice generation and sharing
- Financial reports (revenue, expenses, collection rate, top clients)
- Business profile settings (company info, currency, tax rate)

## File Structure
```
app/
  _layout.tsx           - Root layout with providers
  (tabs)/
    _layout.tsx         - Tab bar with 4 tabs (liquid glass + classic)
    index.tsx           - Dashboard
    invoices.tsx        - Invoice list with filters
    clients.tsx         - Client list
    more.tsx            - Menu: products, expenses, reports, settings
  invoice/
    create.tsx          - Create/edit invoice (modal)
    [id].tsx            - Invoice detail with payment recording
  client/
    create.tsx          - Create/edit client (modal)
    [id].tsx            - Client detail with invoice history
  product/create.tsx    - Create/edit product (modal)
  expense/create.tsx    - Create/edit expense (modal)
  settings.tsx          - Business profile settings
  reports.tsx           - Financial analytics
  products.tsx          - Product catalog list
  expenses.tsx          - Expense tracking list

components/
  StatusBadge.tsx       - Invoice status indicator
  InvoiceCard.tsx       - Invoice list item card
  StatCard.tsx          - Dashboard stat card
  FormField.tsx         - Reusable form input
  EmptyState.tsx        - Empty state placeholder
  ErrorBoundary.tsx     - Error boundary wrapper
  ErrorFallback.tsx     - Error fallback UI

lib/
  types.ts             - TypeScript interfaces & constants
  storage.ts           - AsyncStorage CRUD operations
  data-context.tsx     - React Context provider for app data
  utils.ts             - Formatting & utility functions
  pdf.ts               - Invoice HTML/PDF generation
  query-client.ts      - React Query client config

constants/
  colors.ts            - Theme color palette
```

## Color Scheme
- Primary: #0D7377 (teal)
- Accent: #FF6B35 (orange)
- Success: #2ECC71 (green)
- Warning: #F39C12 (amber)
- Danger: #E74C3C (red)
- Background: #F5F7FA

## Workflows
- `Start Backend` - Express server on port 5000
- `Start Frontend` - Expo dev server on port 8081

## Data Model
- BusinessProfile: Company details, currency, tax settings
- Client: Contact info, address
- Product: Name, price, unit, category
- Invoice: Line items, payments, status tracking, tax/discount
- Expense: Amount, category, date
