import { z } from 'zod';

export const bidSchema = z.object({
  auctionId: z.string().min(1),
  playerId: z.string().min(1),
  teamId: z.string().min(1),
  amount: z.number().int().positive(),
});

export const teamSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().min(2).max(6),
  ownerEmail: z.string().email().optional(),
});

export const playerSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(16).max(45),
  position: z.string().min(2),
  experience: z.number().int().min(0),
  basePrice: z.number().int().min(100),
  tournamentId: z.string().min(1).optional(),
});
