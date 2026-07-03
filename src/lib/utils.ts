import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(date));
}

export function formatDistanceLabel(distance: string) {
  return distance === "OPEN" ? "Livre" : distance.replace("KM_", "").replace("_", ",") + " km";
}
