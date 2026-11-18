import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/lib/database/prisma.service.js";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(q: string) {
    const query = q.trim();

    if (query.length < 2) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });
  }
}
