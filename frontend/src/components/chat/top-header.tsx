import { ArchiveIcon, Bot, ChevronDown, Menu, Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useProviderModels } from "@/hooks/use-provider-models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TopHeaderProps {
  onOpenMobileSidebar?: () => void;
  onCreateArchive?: () => void;
  activeArchiveName?: string | null;
  degraded?: boolean;
}

export function TopHeader({
  onOpenMobileSidebar,
  onCreateArchive,
  activeArchiveName,
  degraded = false,
}: TopHeaderProps) {
  const { healthyResearchModels, selectedModel, isRefreshing } = useProviderModels();
  const healthyProviderCount = new Set(healthyResearchModels.map((model) => model.split("/")[0])).size;
  const selectedModelLabel = selectedModel.split("/").slice(1).join("/") || selectedModel;
  const providerLabel = isRefreshing
    ? "Checking providers"
    : healthyProviderCount > 0
      ? `${healthyProviderCount} provider${healthyProviderCount === 1 ? "" : "s"} ready`
      : "Provider setup needed";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 shadow-[0_1px_8px_rgba(59,111,212,0.06)] backdrop-blur-xl dark:bg-[#0d0e12]/95">
      <div className="top-header grid min-h-[52px] grid-cols-[1fr_auto] items-center gap-3 px-3 py-1.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="desk-topbar-button h-9 w-9 rounded-lg text-muted-foreground hover:border-[#3b6fd450] hover:bg-muted hover:text-foreground md:hidden"
                onClick={onOpenMobileSidebar}
                aria-label="Open navigation"
              >
                <Menu className="h-4.5 w-4.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open navigation</TooltipContent>
          </Tooltip>

          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3b6fd450] bg-[#3b6fd4] shadow-[0_0_24px_rgba(59,111,212,0.24)]"
              aria-hidden
            >
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                BestDel Intelligence Desk
              </div>
              <div className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                Calm command workspace
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden min-w-0 max-w-[310px] items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-[#d4a03b55] hover:text-foreground md:inline-flex"
                aria-label="Open active archive menu"
              >
                <ArchiveIcon className="h-3.5 w-3.5 shrink-0 text-[#d4a03b]" />
                <span className="shrink-0 font-medium text-[#d4a03b]">Active Archive</span>
                <span className="truncate text-foreground/80">{activeArchiveName || "Workspace"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 border-border/70 bg-popover text-popover-foreground dark:border-[#2a2d38] dark:bg-[#0d0e12] dark:text-[#eeeef5]">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground dark:text-[#8b8b9f]">
                Archive workspace
              </DropdownMenuLabel>
              <DropdownMenuItem disabled className="rounded-md text-xs text-foreground opacity-100 dark:text-[#c7c7d4]">
                {activeArchiveName || "No archive selected"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border dark:bg-[#2a2d38]" />
              <DropdownMenuItem disabled className="rounded-md text-xs text-muted-foreground opacity-100 dark:text-[#8b8b9f]">
                Use the sidebar dossier list to switch archives.
              </DropdownMenuItem>
              {onCreateArchive && (
                <DropdownMenuItem onClick={onCreateArchive} className="rounded-md text-xs text-[#b7791f] focus:bg-[#d4a03b18] focus:text-[#8a5b13] dark:text-[#d4a03b] dark:focus:text-[#f3c76f]">
                  Create new archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {onCreateArchive && (
          <div className="ml-auto flex items-center gap-2 justify-self-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden max-w-[230px] items-center gap-2 rounded-full border border-[#2a2d38] bg-[#111215] px-3 py-1 text-[11px] font-medium text-[#9a9ab0] lg:inline-flex">
                  <Server className="h-3.5 w-3.5 text-[#d4a03b]" />
                  <span className="truncate">{providerLabel}</span>
                  {healthyProviderCount > 0 && (
                    <span className="truncate text-[#6b6b82]">/ {selectedModelLabel}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {healthyProviderCount > 0 ? `Active model: ${selectedModelLabel}` : "Configure provider keys in Settings"}
              </TooltipContent>
            </Tooltip>
            <div className={degraded ? "status-pill-degraded" : "status-pill-ready"}>
              <motion.span
                className="status-dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {degraded ? "AI degraded" : "AI ready"}
            </div>
            <Button
              size="sm"
              onClick={onCreateArchive}
              className="desk-topbar-button desk-topbar-primary h-9 shrink-0 gap-2 rounded-lg border border-[#d4a03b70] bg-[var(--accent-secondary)] px-3 text-[#111215] shadow-[0_12px_28px_rgba(212,160,59,0.22)] hover:bg-[#f3c76f] hover:text-[#08090b]"
              data-testid="button-top-new-archive"
              aria-label="Create new archive"
            >
              <ArchiveIcon className="hidden h-4 w-4 sm:block" />
              <Plus className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">New Archive</span>
              <span className="sm:hidden">Archive</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
