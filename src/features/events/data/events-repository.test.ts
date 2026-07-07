import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_EVENT_VIEW_COLUMNS, PUBLIC_EVENT_VIEW_NAME } from "./events-repository";

test("public events repository uses the safe public_events view contract", () => {
  assert.equal(PUBLIC_EVENT_VIEW_NAME, "public_events");
  assert.deepEqual(PUBLIC_EVENT_VIEW_COLUMNS, [
    "id",
    "tenantId",
    "groupId",
    "title",
    "description",
    "eventType",
    "date",
    "startTime",
    "endTime",
    "location",
    "distance",
    "level",
    "suggestedPace",
    "capacity"
  ]);
  assert.ok(!PUBLIC_EVENT_VIEW_COLUMNS.includes("checkInCode"));
  assert.ok(!PUBLIC_EVENT_VIEW_COLUMNS.includes("checkInOpensAt"));
  assert.ok(!PUBLIC_EVENT_VIEW_COLUMNS.includes("checkInClosesAt"));
});
