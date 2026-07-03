import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/shared/card";
import { formatDate, formatDistanceLabel } from "@/lib/utils";

interface EventCardProps {
  event: {
    title: string;
    groupName: string;
    date: string;
    location: string;
    distance: string;
    confirmedCount: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="h-full">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-strong)]">{event.groupName}</p>
      <h3 className="mt-3 text-lg font-bold">{event.title}</h3>
      <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {formatDate(event.date)} • {formatDistanceLabel(event.distance)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {event.location}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {event.confirmedCount} confirmados
        </p>
      </div>
    </Card>
  );
}
