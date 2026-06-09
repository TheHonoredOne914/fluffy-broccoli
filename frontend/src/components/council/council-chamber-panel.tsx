import React from "react";
import { Download, FileText, GitBranch, Scale, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouncillorCard } from "./councillor-card";
import { ChiefVerdictPanel } from "./chief-verdict-panel";
import { DeliberationBoard } from "./deliberation-board";
import { FloorStrategyPanel } from "./floor-strategy-panel";
import { downloadCouncilDossier } from "./council-dossier-export";
import { RETRIEVING_COUNCILLOR_IDS, type CouncilSession } from "./council-types";

export function CouncilChamberPanel({ session }: { session: CouncilSession | null }) {
  if (!session) {
    return (
      <section className="rounded-2xl border border-border/70 bg-background/95 p-5 text-foreground shadow-sm dark:border-[#27324a] dark:bg-[linear-gradient(145deg,rgba(13,18,30,0.94),rgba(7,9,14,0.96))]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-200">Council Mode</p>
        <h2 className="mt-1 text-lg font-semibold">Council chamber initializing</h2>
        <p className="mt-2 text-sm text-muted-foreground">Six specialist councillors are preparing the parliamentary advisory session.</p>
      </section>
    );
  }

  const completedCount = RETRIEVING_COUNCILLOR_IDS.filter((id) => session.councillors[id]?.status === "complete").length;
  const status = statusCopy(session.status);
  const side = session.stance === "government" ? "Treasury Bench" : session.stance === "opposition" ? "Opposition" : "Independent brief";
  const phaseSteps = buildCouncilPhases(session.status, completedCount);

  return (
    <section className="space-y-5" data-council-chamber>
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-5 shadow-sm dark:border-[#27324a] dark:bg-[radial-gradient(circle_at_top,rgba(59,111,212,0.16),transparent_36%),linear-gradient(145deg,rgba(12,17,29,0.96),rgba(7,9,14,0.98))] dark:shadow-[0_24px_90px_-52px_rgba(59,111,212,0.7)]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:border-amber-300/30 dark:text-amber-100">
                Council Mode
              </span>
              <span className="rounded-full border border-[#10182814] bg-white/70 px-2.5 py-1 text-[11px] text-[#667085] dark:border-[#3b6fd4]/35 dark:bg-[#3b6fd4]/10 dark:text-[#b9caff]">
                Multi-agent MUN cabinet
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl dark:text-slate-50">Council Chamber</h2>
            <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted-foreground dark:text-[#a7b1c5]">
              Legal, economic, strategic, social, historical, and opposition agents inspect the evidence before a Chief verdict turns it into usable floor strategy.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-300/20 dark:text-emerald-100">
              {status}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadCouncilDossier(session)}
              disabled={session.status !== "complete"}
              className="border-amber-500/35 bg-background/70 text-amber-700 hover:bg-amber-500/10 dark:border-amber-300/30 dark:bg-black/20 dark:text-amber-100 dark:hover:bg-amber-300/10 dark:hover:text-amber-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Chamber Brief
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
          <HeaderStat label="Agenda" value={session.topic || "Committee agenda pending"} />
          <HeaderStat label="House / committee" value="Indian parliamentary committee" />
          <HeaderStat label="Role / side" value={side} />
          <HeaderStat label="Councillors" value={`${completedCount}/6 briefs sealed`} />
        </div>

        <CouncilPhaseRail steps={phaseSteps} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <CouncilPurposePanel completedCount={completedCount} agreementScore={session.agreement_score} />
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm dark:border-[#27324a] dark:bg-black/20">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-foreground dark:text-slate-50">Cabinet Map</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Each councillor contributes evidence, vulnerabilities, and usable floor lines.</p>
            </div>
            <Users className="h-4 w-4 text-[#3b6fd4]" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Legal", "Treaties, doctrine, rights exposure"],
              ["Economic", "Budgets, capacity, tradeoffs"],
              ["Strategic", "POIs, blocs, timing"],
              ["Social", "Affected groups and legitimacy"],
              ["Historical", "Precedent and institutional memory"],
              ["Opposition", "Adversarial stress test"],
            ].map(([label, desc]) => (
              <div key={label} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <p className="text-[11px] font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RETRIEVING_COUNCILLOR_IDS.map((id) => (
          <CouncillorCard key={id} councillorId={id} output={session.councillors[id]} />
        ))}
      </div>
      <DeliberationBoard seals={session.seals} disputes={session.disputes} agreementScore={session.agreement_score} />
      <FloorStrategyPanel verdict={session.verdict} />
      <ChiefVerdictPanel verdict={session.verdict} stream={session.chief_verdict_stream} />
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.055] p-4 text-sm text-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Council Dossier</p>
            <p className="mt-1 text-[#d8cda9]">Package the verdict, conflict lines, POIs, and chamber strategy into a usable floor brief.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadCouncilDossier(session)}
            disabled={session.status !== "complete"}
            className="border-amber-300/30 bg-black/20 text-amber-100 hover:bg-amber-300/10 hover:text-amber-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Strategy Brief
          </Button>
        </div>
      </div>
    </section>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 dark:border-white/[0.07] dark:bg-black/25">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-[#7f8aa3]">{label}</p>
      <p className="mt-1 break-words text-sm leading-5 text-foreground dark:text-[#e5ebfb]">{value}</p>
    </div>
  );
}

function CouncilPhaseRail({
  steps,
}: {
  steps: Array<{ label: string; description: string; state: "done" | "active" | "pending" }>;
}) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={
            step.state === "done"
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3"
              : step.state === "active"
                ? "rounded-lg border border-[#3b6fd4]/40 bg-[#3b6fd4]/10 p-3 shadow-[0_0_0_1px_rgba(59,111,212,0.08)]"
                : "rounded-lg border border-border/60 bg-muted/20 p-3"
          }
        >
          <div className="flex items-center gap-2">
            <span className={
              step.state === "done"
                ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white"
                : step.state === "active"
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#3b6fd4] text-[10px] font-bold text-white"
                  : "flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
            }>
              {index + 1}
            </span>
            <p className="text-xs font-semibold text-foreground">{step.label}</p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

function CouncilPurposePanel({ completedCount, agreementScore }: { completedCount: number; agreementScore: number }) {
  const agreement = Math.max(0, Math.min(100, Math.round(agreementScore || 0)));
  return (
    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm dark:border-[#27324a] dark:bg-black/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-foreground dark:text-slate-50">What Council Mode Does</p>
          <p className="mt-1 text-[11px] text-muted-foreground">It turns raw evidence into a debate-ready strategic brief through forced specialization.</p>
        </div>
        <GitBranch className="h-4 w-4 text-amber-600 dark:text-amber-200" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <PurposeMetric icon={FileText} label="Briefs" value={`${completedCount}/6`} />
        <PurposeMetric icon={ShieldCheck} label="Agreement" value={`${agreement}%`} />
        <PurposeMetric icon={Scale} label="Output" value="Chief verdict" />
      </div>
      <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-[12px] leading-5 text-muted-foreground">
        Councillors retrieve and argue from different domains, then the deliberation layer exposes endorsed claims, contested claims, POIs, speech strategy, and vulnerabilities.
      </div>
    </div>
  );
}

function PurposeMetric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <Icon className="h-4 w-4 text-[#3b6fd4]" />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function buildCouncilPhases(status: CouncilSession["status"], completedCount: number) {
  const order: CouncilSession["status"][] = ["expanding", "retrieving", "briefing", "deliberating", "synthesizing", "complete"];
  const activeIndex = Math.max(0, order.indexOf(status));
  return [
    {
      label: "Assign",
      description: "Topic is split into councillor mandates.",
      state: activeIndex > 0 || completedCount > 0 ? "done" : "active",
    },
    {
      label: "Retrieve",
      description: "Six briefs collect evidence and claims.",
      state: completedCount === 6 || activeIndex > 2 ? "done" : activeIndex >= 1 ? "active" : "pending",
    },
    {
      label: "Deliberate",
      description: "Council seals, disputes, and weak points are compared.",
      state: activeIndex > 3 ? "done" : activeIndex === 3 ? "active" : "pending",
    },
    {
      label: "Verdict",
      description: "Chief synthesizes floor strategy and speech ammunition.",
      state: status === "complete" ? "done" : activeIndex >= 4 ? "active" : "pending",
    },
  ] as Array<{ label: string; description: string; state: "done" | "active" | "pending" }>;
}

function statusCopy(status: CouncilSession["status"]): string {
  if (status === "briefing") return "Chamber Active";
  if (status === "deliberating") return "Deliberation Running";
  if (status === "synthesizing") return "Strategy Synthesizing";
  if (status === "complete") return "Chamber Concluded";
  return "Council Error";
}
