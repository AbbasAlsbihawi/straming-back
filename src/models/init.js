import Prisma from "@prisma/client";

// PrismaClient is not available when testing
const { PrismaClient } = Prisma || {};
const prisma = PrismaClient ? new PrismaClient() : {};

export const User = prisma.user; 
export const Video = prisma.video; 
export const File = prisma.file; 
export const WatchParty = prisma.watchParty;
export const PartyMember = prisma.partyMember;
export const ChatMessage = prisma.chatMessage;
