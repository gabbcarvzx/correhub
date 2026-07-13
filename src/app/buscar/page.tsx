"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, SearchX, Users, Calendar, Store, ArrowRight, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { PageTransition } from "@/components/ui/page-transition"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface SearchGroup {
  id: string; slug: string; name: string; description: string
  meetingPoint: string; leader: string; members: number; href: string
}
interface SearchEvent {
  id: string; slug: string; title: string; date: string; location: string
  distance: string; type: string; groupName: string; groupSlug: string; href: string
}
interface SearchPartner {
  id: string; slug: string; name: string; category: string
  description: string; coupon: string; href: string
}

interface SearchSection {
  type: "Grupo" | "Evento" | "Parceiro"
  items: { id: string; title: string; subtitle: string; href: string; badge?: string }[]
}

const RECENT_SEARCHES_KEY = "corre-recent-searches"
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

function eventTypeBadge(type: string): string {
  const map: Record<string, string> = {
    TRAINING: "Treino",
    LONG_RUN: "Longão",
    OFFICIAL_RACE: "Corrida",
    MEETUP: "Encontro",
    CHALLENGE: "Desafio",
  }
  return map[type] ?? type
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isClient, setIsClient] = useState(false)
  const [results, setResults] = useState<SearchSection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const isDebouncing = query !== debouncedQuery

  useEffect(() => {
    setIsClient(true)
    setRecentSearches(getRecentSearches())
  }, [])

  // Fetch from API when debounced query changes
  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!q) {
      setResults([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)

    fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=5`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed")
        return res.json() as Promise<{
          groups: SearchGroup[]
          events: SearchEvent[]
          partners: SearchPartner[]
        }>
      })
      .then((data) => {
        const sections: SearchSection[] = []

        if (data.groups.length > 0) {
          sections.push({
            type: "Grupo",
            items: data.groups.map((g) => ({
              id: g.id,
              title: g.name,
              subtitle: g.leader,
              href: g.href,
              badge: `${g.members} membros`,
            })),
          })
        }

        if (data.events.length > 0) {
          sections.push({
            type: "Evento",
            items: data.events.map((e) => ({
              id: e.id,
              title: e.title,
              subtitle: `${e.groupName} • ${e.location}`,
              href: e.href,
              badge: eventTypeBadge(e.type),
            })),
          })
        }

        if (data.partners.length > 0) {
          sections.push({
            type: "Parceiro",
            items: data.partners.map((p) => ({
              id: p.id,
              title: p.name,
              subtitle: p.category,
              href: p.href,
            })),
          })
        }

        setResults(sections)
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setResults([])
        }
      })
      .finally(() => setIsLoading(false))
  }, [debouncedQuery])

  const selectableItems = results.flatMap((r) =>
    r.items.slice(0, 5)
  )
  const totalSelectable = selectableItems.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < totalSelectable - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalSelectable - 1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const selected = selectableItems[selectedIndex]
      if (selected) {
        saveRecentSearch(debouncedQuery.trim())
        window.location.href = selected.href
      }
    }
  }

  const handleSelect = useCallback((href: string) => {
    saveRecentSearch(debouncedQuery.trim())
    router.push(href)
  }, [debouncedQuery, router])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [debouncedQuery])

  const groupIcons: Record<string, typeof Users> = {
    Grupo: Users,
    Evento: Calendar,
    Parceiro: Store,
  }

  const showInitial = isClient && !debouncedQuery.trim()
  const showLoading = isClient && !!(debouncedQuery.trim() && (isDebouncing || isLoading))
  const showEmpty = isClient && debouncedQuery.trim() && !showLoading && results.length === 0
  const showResults = isClient && debouncedQuery.trim() && !showLoading && results.length > 0

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-muted" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar grupo, evento ou parceiro"
                className="border-0 bg-transparent px-0"
              />
              {showLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" />
              )}
            </div>
          </Card>

          {showInitial && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Pesquisas recentes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-solid px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:bg-surface-strong"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {term}
                  </button>
                ))}
                <button
                  onClick={() => {
                    clearRecentSearches()
                    setRecentSearches([])
                  }}
                  className="text-xs text-muted underline underline-offset-2 hover:text-fg"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}

          {showResults && (
            <div ref={listRef} className="mt-8 space-y-8">
              {(() => {
                let idx = 0
                return results.map((section) => {
                  const Icon = groupIcons[section.type]
                  const hasMore = section.items.length >= 5
                  const showItems = section.items.slice(0, 5)

                  return (
                    <section key={section.type}>
                      <div className="mb-3 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted" />
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                          {section.type}
                        </h2>
                        <span className="text-xs text-muted">
                          ({showItems.length})
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {showItems.map((item) => {
                          const currentIdx = idx++
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => handleSelect(item.href)}
                              className={cn(
                                "flex items-center justify-between rounded-lg border border-border bg-surface-solid p-4 transition-all hover:border-border-strong hover:shadow-sm",
                                selectedIndex === currentIdx && "ring-2 ring-brand-500"
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-fg">{item.title}</p>
                                <p className="truncate text-sm text-muted">{item.subtitle}</p>
                              </div>
                              {item.badge && (
                                <Badge variant="outline" size="sm" className="ml-3 shrink-0">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          )
                        })}
                        {hasMore && (
                          <Link
                            href={`/${section.type === "Grupo" ? "grupos" : section.type === "Evento" ? "agenda" : "parceiros"}`}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-border-strong hover:text-fg"
                          >
                            Ver todos
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </section>
                  )
                })
              })()}
            </div>
          )}

          {showEmpty && (
            <div className="mt-8">
              <EmptyState
                icon={SearchX}
                title="Nenhum resultado encontrado"
                description={`Nenhum grupo, evento ou parceiro corresponde a "${debouncedQuery}". Tente outro termo.`}
              />
            </div>
          )}
        </div>
      </PageTransition>
    </AppShell>
  )
}
