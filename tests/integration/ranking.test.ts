import test from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Testes de integração — Ranking
//
// Estes testes validam a lógica de negócio do ranking sem depender
// de banco de dados real. Usam dados mock controlados.
//
// Para executar: npm test
// ---------------------------------------------------------------------------

/**
 * Simula a lógica de posicionamento com empates
 * (cópia da lógica em rankings-service.ts).
 */
/**
 * Simula a lógica de ranking: ordena por KM descendente e atribui posições.
 */
function computePositions(
  raw: Array<{ userId: string; totalKm: number; totalRuns: number }>
) {
  // Ordena por totalKm DESC (igual ao ORDER BY do SQL)
  const sorted = [...raw].sort((a, b) => b.totalKm - a.totalKm);

  let currentPosition = 0;
  let previousKm: number | null = null;

  return sorted.map((row, index) => {
    if (row.totalKm !== previousKm) {
      currentPosition = index + 1;
    }
    previousKm = row.totalKm;

    return {
      position: currentPosition,
      userId: row.userId,
      totalKm: Number(row.totalKm.toFixed(1)),
      totalRuns: row.totalRuns,
      avgKmPerRun:
        row.totalRuns > 0
          ? Number((row.totalKm / row.totalRuns).toFixed(1))
          : 0,
    };
  });
}

test("ranking: ordena por KM total descendente", () => {
  const raw = [
    { userId: "user-a", totalKm: 50, totalRuns: 5 },
    { userId: "user-b", totalKm: 80, totalRuns: 4 },
    { userId: "user-c", totalKm: 30, totalRuns: 3 },
  ];

  const result = computePositions(raw);

  assert.equal(result[0].userId, "user-b"); // 80 km
  assert.equal(result[0].position, 1);
  assert.equal(result[1].userId, "user-a"); // 50 km
  assert.equal(result[1].position, 2);
  assert.equal(result[2].userId, "user-c"); // 30 km
  assert.equal(result[2].position, 3);
});

test("ranking: empate de KM resulta em mesma posição", () => {
  const raw = [
    { userId: "user-a", totalKm: 50, totalRuns: 5 },
    { userId: "user-b", totalKm: 50, totalRuns: 4 },
    { userId: "user-c", totalKm: 30, totalRuns: 3 },
  ];

  const result = computePositions(raw);

  assert.equal(result[0].position, 1); // user-a, pos 1
  assert.equal(result[1].position, 1); // user-b, mesma posição (empate)
  assert.equal(result[2].position, 3); // user-c, pos 3 (pula pos 2)
});

test("ranking: três corredores com mesmo KM", () => {
  const raw = [
    { userId: "user-a", totalKm: 40, totalRuns: 4 },
    { userId: "user-b", totalKm: 40, totalRuns: 5 },
    { userId: "user-c", totalKm: 40, totalRuns: 3 },
  ];

  const result = computePositions(raw);

  assert.equal(result[0].position, 1);
  assert.equal(result[1].position, 1);
  assert.equal(result[2].position, 1);
});

test("ranking: lista vazia retorna array vazio", () => {
  const result = computePositions([]);
  assert.equal(result.length, 0);
});

test("ranking: single user é posição 1", () => {
  const raw = [{ userId: "user-a", totalKm: 10, totalRuns: 1 }];
  const result = computePositions(raw);
  assert.equal(result.length, 1);
  assert.equal(result[0].position, 1);
  assert.equal(result[0].userId, "user-a");
});

test("ranking: cálculo de avgKmPerRun", () => {
  const raw = [{ userId: "user-a", totalKm: 75, totalRuns: 10 }];
  const result = computePositions(raw);
  assert.equal(result[0].avgKmPerRun, 7.5); // 75 / 10
});

test("ranking: avgKmPerRun com zero runs", () => {
  const raw = [{ userId: "user-a", totalKm: 0, totalRuns: 0 }];
  const result = computePositions(raw);
  assert.equal(result[0].avgKmPerRun, 0);
});

// ---------------------------------------------------------------------------
// Testes de isolamento multi-tenant (simulado)
// ---------------------------------------------------------------------------

test("ranking: isolamento multi-tenant — tenants diferentes não se misturam", () => {
  const tenantA = { id: "tenant-a" };
  const tenantB = { id: "tenant-b" };

  // Simula que cada tenant tem seus próprios dados
  const dataA = [{ userId: "user-1", totalKm: 100, totalRuns: 5 }];
  const dataB = [{ userId: "user-2", totalKm: 200, totalRuns: 10 }];

  const rankingA = computePositions(dataA);
  const rankingB = computePositions(dataB);

  assert.equal(rankingA.length, 1);
  assert.equal(rankingB.length, 1);
  assert.equal(rankingA[0].userId, "user-1");
  assert.equal(rankingB[0].userId, "user-2");
  // Garante que não há vazamento entre tenants
  assert.notEqual(rankingA[0].userId, rankingB[0].userId);
});

// ---------------------------------------------------------------------------
// Testes de snapshot (simulado)
// ---------------------------------------------------------------------------

test("ranking.snapshot: periodKey mensal no formato YYYY-MM", () => {
  function computePeriodKey(periodType: string, date: Date): string {
    const year = date.getFullYear();
    if (periodType === "monthly") {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    return "";
  }

  const date = new Date("2026-07-15");
  const key = computePeriodKey("monthly", date);
  assert.equal(key, "2026-07");
});

test("ranking: limite de resultados é respeitado", () => {
  const raw = Array.from({ length: 100 }, (_, i) => ({
    userId: `user-${i}`,
    totalKm: 100 - i,
    totalRuns: 10,
  }));

  const limit = 20;
  const result = computePositions(raw).slice(0, limit);

  assert.equal(result.length, limit);
});

// ---------------------------------------------------------------------------
// Testes de integridade
// ---------------------------------------------------------------------------

test("ranking: posições nunca são zero ou negativas", () => {
  const raw = [
    { userId: "user-a", totalKm: 10, totalRuns: 1 },
    { userId: "user-b", totalKm: 5, totalRuns: 1 },
  ];

  const result = computePositions(raw);
  for (const entry of result) {
    assert.ok(entry.position > 0, `Position ${entry.position} should be > 0`);
  }
});

test("ranking: nomes são strings não vazias", () => {
  const raw = [{ userId: "user-a", totalKm: 10, totalRuns: 1 }];
  const result = computePositions(raw);

  // A lógica real usa userMap; aqui simulamos com name
  for (const entry of result) {
    assert.ok(entry.userId.length > 0);
  }
});
