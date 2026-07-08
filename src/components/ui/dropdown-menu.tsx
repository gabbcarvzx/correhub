"use client"

import { cn } from "@/lib/utils"
import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useId,
  type ElementRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentId: string
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null)

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("DropdownMenu sub-components must be used within <DropdownMenu>")
  }
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const contentId = useId()

  const open = controlledOpen ?? internalOpen

  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value)
      } else {
        setInternalOpen(value)
      }
    },
    [onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentId }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = forwardRef<
  ElementRef<"button">,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef, contentId } = useDropdownMenu()

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref, triggerRef]
  )

  return (
    <button
      ref={setRef}
      type="button"
      className={cn("inline-flex items-center justify-center", className)}
      onClick={(e) => {
        onClick?.(e)
        setOpen(!open)
      }}
      aria-haspopup="true"
      aria-expanded={open}
      aria-controls={contentId}
      {...props}
    />
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
}

const DropdownMenuContent = forwardRef<
  ElementRef<"div">,
  DropdownMenuContentProps
>(({ className, align = "start", ...props }, ref) => {
  const { open, setOpen, triggerRef, contentId } = useDropdownMenu()
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen, triggerRef])

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  if (!open) return null

  return (
    <div
      ref={setRef}
      id={contentId}
      role="menu"
      className={cn(
        "absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface-solid p-1 shadow-lg animate-fade-in",
        align === "end" && "right-0",
        align === "start" && "left-0",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenuItem = forwardRef<
  ElementRef<"div">,
  DropdownMenuItemProps
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    role="menuitem"
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-brand-50 hover:text-brand-700 focus:bg-brand-50 focus:text-brand-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenuLabel = forwardRef<
  ElementRef<"div">,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-muted",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = forwardRef<
  ElementRef<"div">,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
