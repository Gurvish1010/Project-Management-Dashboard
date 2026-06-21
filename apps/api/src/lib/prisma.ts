/**
 * Creates and exports one Prisma Client instance for the API.
 * Demonstrates backend setup for the Prisma + PostgreSQL part of the assignment.
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
