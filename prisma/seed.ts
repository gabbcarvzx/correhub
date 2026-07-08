import { hashSync } from "bcryptjs";
import { PrismaClient, ApprovalStatus, DistanceType, EventType, PlanType, RunLevel, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.rankingSnapshot.deleteMany();
  await prisma.runEvent.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.group.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.tenantSettings.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({
    data: {
      name: "São Lourenço da Mata",
      slug: "sao-lourenco-da-mata",
      timezone: "America/Recife",
      plan: PlanType.PREMIUM,
      settings: {
        create: {
          cityDisplayName: "São Lourenço da Mata",
          primaryColor: "#22C55E",
          whatsapp: "5581999990000",
          defaultEventRadiusKm: 5,
          socialLinks: {
            instagram: "@correhub.slm",
            website: "https://correhub.app"
          }
        }
      },
      featureFlags: {
        create: [
          { key: "community_feed", enabled: true, description: "Feed da comunidade" },
          { key: "rankings", enabled: true, description: "Ranking municipal" },
          { key: "partners", enabled: true, description: "Marketplace local" },
          { key: "notifications", enabled: true, description: "Inbox de notificações" },
          { key: "challenges", enabled: true, description: "Desafios e eventos especiais" },
          { key: "premium", enabled: false, description: "Recursos premium futuros" }
        ]
      }
    }
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Admin CorreHub",
        email: "admin@correhub.local",
        passwordHash: hashSync("admin123", 10),
        role: UserRole.ADMIN,
        city: tenant.name
      }
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Carlos Teles",
        email: "lider@correhub.local",
        passwordHash: hashSync("lider123", 10),
        role: UserRole.GROUP_LEADER,
        city: tenant.name,
        paceAvg: "5:42/km",
        preferredDistance: DistanceType.KM_10
      }
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: "Mariana Alves",
        email: "runner@correhub.local",
        passwordHash: hashSync("runner123", 10),
        role: UserRole.RUNNER,
        city: tenant.name,
        paceAvg: "5:54/km",
        preferredDistance: DistanceType.KM_10,
        totalAttendances: 28,
        totalKm: 312
      }
    })
  ]);

  const admin = users[0];
  const leader = users[1];
  const runner = users[2];

  const group = await prisma.group.create({
    data: {
      tenantId: tenant.id,
      slug: "corre-capibaribe",
      name: "Corre Capibaribe",
      description: "Treinos de rua e longões dominicais com foco em constância.",
      meetingPoint: "Praca do Centro",
      meetingDays: ["Ter", "Qui", "Dom"],
      meetingTimes: ["05:20", "05:20", "05:00"],
      distances: [DistanceType.KM_5, DistanceType.KM_10, DistanceType.OPEN],
      leaderUserId: leader.id,
      status: ApprovalStatus.APPROVED,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      planType: PlanType.GROUP_PRO
    }
  });

  await prisma.groupMember.createMany({
    data: [
      {
        tenantId: tenant.id,
        groupId: group.id,
        userId: leader.id,
        role: UserRole.GROUP_LEADER,
        status: ApprovalStatus.APPROVED
      },
      {
        tenantId: tenant.id,
        groupId: group.id,
        userId: runner.id,
        role: UserRole.RUNNER,
        status: ApprovalStatus.APPROVED
      }
    ]
  });

  const event = await prisma.runEvent.create({
    data: {
      tenantId: tenant.id,
      groupId: group.id,
      slug: "intervalado-capibaribe-0807",
      title: "Intervalado de base",
      description: "Sessão progressiva com aquecimento, blocos de 800m e desaquecimento.",
      eventType: EventType.TRAINING,
      date: new Date("2026-07-08T05:20:00.000Z"),
      startTime: new Date("2026-07-08T05:20:00.000Z"),
      endTime: new Date("2026-07-08T06:30:00.000Z"),
      location: "Praca do Centro",
      distance: DistanceType.KM_5,
      level: RunLevel.BEGINNER,
      suggestedPace: "6:10-6:50/km",
      createdById: leader.id,
      checkInCode: "CHK-0807-CAP",
      checkInOpensAt: new Date("2026-07-08T05:00:00.000Z"),
      checkInClosesAt: new Date("2026-07-08T06:45:00.000Z")
    }
  });

  const attendance = await prisma.attendance.create({
    data: {
      tenantId: tenant.id,
      runEventId: event.id,
      userId: runner.id
    }
  });

  await prisma.checkIn.create({
    data: {
      tenantId: tenant.id,
      runEventId: event.id,
      userId: runner.id,
      attendanceId: attendance.id,
      method: "QR_CODE",
      kmReported: 5
    }
  });

  await prisma.partner.create({
    data: {
      tenantId: tenant.id,
      slug: "studio-endorfina",
      name: "Studio Endorfina",
      category: "Academia",
      description: "Treinamento funcional para corredores com foco em prevenção de lesões.",
      address: "Av. Central, 180",
      whatsapp: "81999990001",
      instagram: "@studioendorfina",
      couponCode: "CORRE10",
      featured: true,
      status: ApprovalStatus.APPROVED,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      gallery: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438"]
    }
  });

  const achievements = await prisma.achievement.createMany({
    data: [
      { tenantId: tenant.id, code: "FIRST_RUN", name: "Primeiro treino", description: "Concluiu o primeiro check-in.", icon: "medal", ruleType: "CHECKIN_COUNT", ruleValue: 1 },
      { tenantId: tenant.id, code: "KM_50", name: "50 km", description: "Acumulou 50 km.", icon: "zap", ruleType: "KM_TOTAL", ruleValue: 50 },
      { tenantId: tenant.id, code: "CHECKINS_10", name: "10 check-ins", description: "Registrou 10 presenças.", icon: "trophy", ruleType: "CHECKIN_COUNT", ruleValue: 10 }
    ]
  });

  void achievements;

  const firstAchievement = await prisma.achievement.findFirstOrThrow({
    where: {
      tenantId: tenant.id,
      code: "FIRST_RUN"
    }
  });

  await prisma.userAchievement.create({
    data: {
      tenantId: tenant.id,
      userId: runner.id,
      achievementId: firstAchievement.id
    }
  });

  await prisma.communityPost.create({
    data: {
      tenantId: tenant.id,
      groupId: group.id,
      authorUserId: leader.id,
      title: "Mudança de percurso",
      content: "O treino de quinta sairá da praça e seguirá pela avenida principal por causa de obra no trecho antigo.",
      postType: "ANNOUNCEMENT"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: runner.id,
        type: "EVENT_REMINDER",
        title: "Treino amanhã",
        message: "Seu próximo treino começa amanhã às 05:20.",
        actionUrl: "/agenda"
      },
      {
        tenantId: tenant.id,
        userId: leader.id,
        type: "GROUP_APPROVED",
        title: "Grupo aprovado",
        message: "Seu grupo Corre Capibaribe foi aprovado e esta publico.",
        actionUrl: "/dashboard/grupo"
      }
    ]
  });

  await prisma.rankingSnapshot.create({
    data: {
      tenantId: tenant.id,
      periodType: "MONTH",
      periodKey: "2026-07",
      scopeType: "CITY",
      userId: runner.id,
      attendanceCount: 28,
      kmTotal: 312,
      score: 452,
      position: 7
    }
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorUserId: admin.id,
      entityType: "GROUP",
      entityId: group.id,
      action: "APPROVED",
      metadata: {
        reviewedAt: new Date().toISOString()
      }
    }
  });

  console.log("CorreHub seed concluido com tenant piloto e dados premium.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
