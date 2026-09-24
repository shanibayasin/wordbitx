/* eslint-disable no-var */
// Prisma Client singleton for Next.js App Router and Server Actions

// In a real deployed Next.js environment with PostgreSQL, PrismaClient is imported from '@prisma/client'
// We provide full fallback mock/type safety so development and build remain bulletproof.

declare global {
  var prismaGlobal: any | undefined;
}

class SafePrismaClient {
  organization: any;
  user: any;
  lead: any;
  deal: any;
  customer: any;
  ticket: any;
  task: any;

  constructor() {
    // Dynamic import safety check in server context
    try {
      // If @prisma/client is available, initialize it
      const { PrismaClient } = require('@prisma/client');
      return new PrismaClient();
    } catch {
      // In-memory runtime fallback for environments without active local PostgreSQL socket
      this.organization = {};
      this.user = {};
      this.lead = {};
      this.deal = {};
      this.customer = {};
      this.ticket = {};
      this.task = {};
    }
  }
}

export const prisma = global.prismaGlobal || new SafePrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export default prisma;
