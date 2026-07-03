import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";

interface GroupCardProps {
  group: {
    slug: string;
    name: string;
    description: string;
    leader: string;
    meetingPoint: string;
    members: number;
    status: string;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{group.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.description}</p>
        </div>
        <Badge>{group.status}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
        <p>Lider: {group.leader}</p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {group.meetingPoint}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {group.members} membros
        </p>
      </div>
      <div className="mt-5 flex gap-3">
        <Button asChild className="flex-1">
          <Link href={`/grupos/${group.slug}`}>Ver grupo</Link>
        </Button>
        <Button className="flex-1" variant="secondary">
          Participar
        </Button>
      </div>
    </Card>
  );
}
