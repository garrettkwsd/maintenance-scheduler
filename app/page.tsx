"use client";
import React, { useMemo, useState } from "react";
import { Trash2, Plus, Shuffle, Download } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  name: string;
  frequencyWeeks: number;
  qualifiedNames?: string[];
  qualifiedIds?: string[];
  lastCompleted: string;
  assignEntireTeam: boolean;
};

type HistoryRow = {
  date: string;
  taskId: string;
  taskName: string;
  memberId: string;
};

type Assignment = {
  weekStart: string;
  taskId: string;
  taskName: string;
  memberId: string | null;
  memberName: string;
  note: string;
};

type ScheduleResult = {
  weekStart: string;
  assignments: Assignment[];
};

type SchedulerParams = {
  team: TeamMember[];
  tasks: Task[];
  history: HistoryRow[];
  scheduleStart: string;
  weeklyCapacity: number;
};

type SectionCardProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type CheckInputProps = React.InputHTMLAttributes<HTMLInputElement>;

type PillProps = {
  children: React.ReactNode;
  tone?: "default" | "danger";
};

const uid = (): string => Math.random().toString(36).slice(2, 10);

const initialMembers: TeamMember[] = [
  { id: uid(), name: "Cody" },
  { id: uid(), name: "Aiden" },
  { id: uid(), name: "Deane" },
  { id: uid(), name: "Kevin" },
  { id: uid(), name: "Josh" },
  { id: uid(), name: "Dave" },
];

const initialTasks: Task[] = [
  { id: uid(), name: "Bathroom & Trash Cans", frequencyWeeks: 1, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh", "Dave"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Wash Bay", frequencyWeeks: 2, qualifiedNames: ["Cody", "Aiden", "Josh"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Oven Flue & Burner Fan", frequencyWeeks: 36, qualifiedNames: ["Josh", "Cody"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Powder Booth", frequencyWeeks: 3, qualifiedNames: ["Cody", "Aiden", "Josh"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Laser Filter & Trough", frequencyWeeks: 12, qualifiedNames: ["Dave", "Deane"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "CNC/VTL Metal Shavings", frequencyWeeks: 4, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh", "Dave"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Mounting Area", frequencyWeeks: 2, qualifiedNames: ["Cody", "Josh", "Aiden", "Deane", "Kevin"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Fabrication Area", frequencyWeeks: 2, qualifiedNames: ["Deane", "Cody", "Josh", "Aiden", "Kevin"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Flight Bar Tracks", frequencyWeeks: 12, qualifiedNames: ["Cody", "Josh", "Aiden"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Tool Room", frequencyWeeks: 3, qualifiedNames: ["Deane", "Aiden", "Josh", "Cody", "Kevin"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Break Room", frequencyWeeks: 1, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh", "Dave"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Your Choice", frequencyWeeks: 3, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh", "Dave"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Powder Guns", frequencyWeeks: 2, qualifiedNames: ["Cody", "Josh", "Aiden"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Solution for Broken Equipment", frequencyWeeks: 2, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh", "Dave"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Solar Panels", frequencyWeeks: 26, qualifiedNames: ["Cody", "Aiden", "Deane", "Kevin", "Josh"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Pressure Wash Wash Bay", frequencyWeeks: 12, qualifiedNames: ["Cody", "Josh", "Aiden", "Deane", "Kevin"], lastCompleted: "", assignEntireTeam: false },
  { id: uid(), name: "Team Sweep", frequencyWeeks: 12, qualifiedNames: ["Cody", "Josh", "Aiden", "Deane", "Kevin", "Dave"], lastCompleted: "", assignEntireTeam: true },
  { id: uid(), name: "Sand Blast", frequencyWeeks: 4, qualifiedNames: ["Cody", "Josh", "Aiden", "Deane", "Kevin"], lastCompleted: "", assignEntireTeam: false },
];

function addWeeks(dateStr: string, weeks: number): Date {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function weekLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildInitialTasks(members: TeamMember[]): Task[] {
  return initialTasks.map((task) => ({
    ...task,
    qualifiedIds: members
      .filter((member) => task.qualifiedNames?.includes(member.name))
      .map((member) => member.id),
  }));
}

function buildSchedule({ team, tasks, history, scheduleStart, weeklyCapacity }: SchedulerParams): ScheduleResult {
  const memberMap = Object.fromEntries(team.map((member) => [member.id, member.name]));
  const counts = Object.fromEntries(team.map((member) => [member.id, 0]));
  const recent = Object.fromEntries(team.map((member) => [member.id, "1900-01-01"]));
  const taskLastCompleted = Object.fromEntries(tasks.map((task) => [task.id, task.lastCompleted || ""]));

  history.forEach((row) => {
    if (row.memberId && counts[row.memberId] !== undefined) counts[row.memberId] += 1;
    if (row.memberId && row.date > (recent[row.memberId] || "1900-01-01")) recent[row.memberId] = row.date;
    if (row.taskId && row.date > (taskLastCompleted[row.taskId] || "")) taskLastCompleted[row.taskId] = row.date;
  });

  const weekStartDate = new Date(`${scheduleStart}T00:00:00`);
  const weekStart = toYMD(weekStartDate);
  const assignments: Assignment[] = [];
  const usedMembers = new Set<string>();
  const capacity = Math.max(1, Number(weeklyCapacity) || team.length || 1);
  const remainingCapacity = () => capacity - usedMembers.size;

  const dueScore = (task: Task): number => {
    const lastCompleted = taskLastCompleted[task.id] || task.lastCompleted || "";
    if (!lastCompleted) return Number.POSITIVE_INFINITY;
    const nextDue = addWeeks(lastCompleted, Number(task.frequencyWeeks || 1));
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((weekStartDate.getTime() - nextDue.getTime()) / msPerWeek);
  };

  const chooseMember = (qualifiedIds: string[]): string | null => {
    const available = qualifiedIds.filter((id) => memberMap[id] && !usedMembers.has(id));
    if (!available.length) return null;

    const leastCount = Math.min(...available.map((id) => counts[id] || 0));
    const leastLoaded = available.filter((id) => (counts[id] || 0) === leastCount);
    const oldestRecent = [...leastLoaded].sort((a, b) =>
      String(recent[a] || "1900-01-01").localeCompare(String(recent[b] || "1900-01-01"))
    );
    const oldestDate = recent[oldestRecent[0]] || "1900-01-01";
    const tiePool = oldestRecent.filter((id) => (recent[id] || "1900-01-01") === oldestDate);
    return shuffle(tiePool)[0] || null;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const aScore = dueScore(a);
    const bScore = dueScore(b);
    if (aScore !== bScore) return bScore - aScore;
    return (a.frequencyWeeks || 1) - (b.frequencyWeeks || 1);
  });

  for (const task of sortedTasks) {
    if (remainingCapacity() <= 0) break;

    const lastCompleted = taskLastCompleted[task.id] || task.lastCompleted || "";
    const isDue = !lastCompleted || weekStartDate >= addWeeks(lastCompleted, Number(task.frequencyWeeks || 1));
    if (!isDue) continue;

    if (task.assignEntireTeam) {
      if (remainingCapacity() >= team.length) {
        team.forEach((member) => {
          assignments.push({
            weekStart,
            taskId: task.id,
            taskName: task.name || "Untitled task",
            memberId: member.id,
            memberName: member.name,
            note: `Teamwide task every ${task.frequencyWeeks} week(s)`,
          });
          usedMembers.add(member.id);
          counts[member.id] = (counts[member.id] || 0) + 1;
          recent[member.id] = weekStart;
        });
        taskLastCompleted[task.id] = weekStart;
        break;
      }
      continue;
    }

    const qualified = (task.qualifiedIds || []).filter((id) => memberMap[id]);
    const chosenId = chooseMember(qualified);
    if (!chosenId) continue;

    assignments.push({
      weekStart,
      taskId: task.id,
      taskName: task.name || "Untitled task",
      memberId: chosenId,
      memberName: memberMap[chosenId] || "Unknown",
      note: `Due every ${task.frequencyWeeks} week(s)`,
    });
    usedMembers.add(chosenId);
    counts[chosenId] = (counts[chosenId] || 0) + 1;
    recent[chosenId] = weekStart;
    taskLastCompleted[task.id] = weekStart;
  }

  if (remainingCapacity() > 0) {
    const fallbackTasks = [...tasks]
      .filter((task) => !assignments.some((assignment) => assignment.taskId === task.id))
      .filter((task) => !task.assignEntireTeam)
      .sort((a, b) => {
        const aLast = taskLastCompleted[a.id] || a.lastCompleted || "";
        const bLast = taskLastCompleted[b.id] || b.lastCompleted || "";
        const aNext = !aLast ? new Date("1900-01-01T00:00:00") : addWeeks(aLast, Number(a.frequencyWeeks || 1));
        const bNext = !bLast ? new Date("1900-01-01T00:00:00") : addWeeks(bLast, Number(b.frequencyWeeks || 1));
        return aNext.getTime() - bNext.getTime();
      });

    for (const task of fallbackTasks) {
      if (remainingCapacity() <= 0) break;
      const qualified = (task.qualifiedIds || []).filter((id) => memberMap[id]);
      const chosenId = chooseMember(qualified);
      if (!chosenId) continue;

      assignments.push({
        weekStart,
        taskId: task.id,
        taskName: task.name || "Untitled task",
        memberId: chosenId,
        memberName: memberMap[chosenId] || "Unknown",
        note: `Queued fill-in task, frequency ${task.frequencyWeeks} week(s)`,
      });
      usedMembers.add(chosenId);
      counts[chosenId] = (counts[chosenId] || 0) + 1;
      recent[chosenId] = weekStart;
    }
  }

  return { weekStart, assignments };
}

function runSchedulerTests(team: TeamMember[], tasks: Task[]): { name: string; passed: boolean }[] {
  const results: { name: string; passed: boolean }[] = [];
  const teamwideTask = tasks.find((task) => task.assignEntireTeam);

  if (teamwideTask) {
    const generated = buildSchedule({
      team,
      tasks: tasks.map((task) =>
        task.id === teamwideTask.id ? { ...task, lastCompleted: "" } : { ...task, lastCompleted: "2099-01-01" }
      ),
      history: [],
      scheduleStart: "2026-01-05",
      weeklyCapacity: team.length,
    });

    results.push({
      name: "Teamwide task fills full week",
      passed:
        generated.assignments.length === team.length &&
        generated.assignments.every((assignment) => assignment.taskId === teamwideTask.id),
    });
  }

  const regularTasks = tasks.filter((task) => !task.assignEntireTeam).slice(0, Math.max(2, team.length));
  if (regularTasks.length >= 2) {
    const generated = buildSchedule({
      team,
      tasks: regularTasks.map((task) => ({ ...task, lastCompleted: "" })),
      history: [],
      scheduleStart: "2026-01-05",
      weeklyCapacity: Math.min(team.length, regularTasks.length),
    });

    const uniqueMembers = new Set(generated.assignments.map((assignment) => assignment.memberId));
    results.push({
      name: "Regular tasks do not double-assign members",
      passed: uniqueMembers.size === generated.assignments.length,
    });
  }

  const fillInTasks = tasks.filter((task) => !task.assignEntireTeam).slice(0, 3);
  if (fillInTasks.length >= 2 && team.length >= 2) {
    const generated = buildSchedule({
      team: team.slice(0, 2),
      tasks: fillInTasks.map((task, index) => ({
        ...task,
        qualifiedIds: [team[index % 2].id],
        lastCompleted: "2099-01-01",
      })),
      history: [],
      scheduleStart: "2026-01-05",
      weeklyCapacity: 2,
    });

    results.push({
      name: "Fallback tasks can fill empty weekly slots",
      passed: generated.assignments.length === 2,
    });
  }

  const qualifiedTask = tasks.find((task) => !task.assignEntireTeam && (task.qualifiedIds || []).length >= 1);
  if (qualifiedTask && team.length >= 2) {
    const allowedId = qualifiedTask.qualifiedIds![0];
    const generated = buildSchedule({
      team,
      tasks: [
        { ...qualifiedTask, qualifiedIds: [allowedId], lastCompleted: "" },
        ...tasks.filter((task) => task.id !== qualifiedTask.id).map((task) => ({ ...task, lastCompleted: "2099-01-01" })),
      ],
      history: [],
      scheduleStart: "2026-01-05",
      weeklyCapacity: 1,
    });

    results.push({
      name: "Qualified-only tasks stay with qualified members",
      passed: generated.assignments.length === 1 && generated.assignments[0].memberId === allowedId,
    });
  }

  return results;
}

function SectionCard({ title, action, children, className = "" }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function TextInput({ className = "", ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 ${className}`}
    />
  );
}

function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 ${className}`}
    />
  );
}

function CheckInput({ className = "", ...props }: CheckInputProps) {
  return <input type="checkbox" {...props} className={`h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 ${className}`} />;
}

function Pill({ children, tone = "default" }: PillProps) {
  const styles = tone === "danger" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{children}</span>;
}

export default function MaintenanceSchedulerApp() {
  const today = new Date();
  const nextMonday = new Date(today);
  const day = nextMonday.getDay();
  const diff = (8 - (day || 7)) % 7;
  nextMonday.setDate(nextMonday.getDate() + diff);

  const [team, setTeam] = useState<TeamMember[]>(initialMembers);
  const [tasks, setTasks] = useState<Task[]>(() => buildInitialTasks(initialMembers));
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [scheduleStart, setScheduleStart] = useState<string>(toYMD(nextMonday));
  const [weeklyCapacity, setWeeklyCapacity] = useState<number>(initialMembers.length);
  const [generated, setGenerated] = useState<ScheduleResult | null>(null);
  const [seedNote, setSeedNote] = useState<string>("Optional: paste notes here for your own reference.");

  const stats = useMemo(() => {
    const all: { memberId: string }[] = [...history];
    if (generated) {
      generated.assignments.forEach((assignment) => {
        if (assignment.memberId) all.push({ memberId: assignment.memberId });
      });
    }

    const counts = Object.fromEntries(team.map((member) => [member.id, 0]));
    all.forEach((row) => {
      if (row.memberId && counts[row.memberId] !== undefined) counts[row.memberId] += 1;
    });

    return team.map((member) => ({ name: member.name || "Unnamed", count: counts[member.id] || 0 }));
  }, [team, history, generated]);

  const testResults = useMemo(() => runSchedulerTests(team, tasks), [team, tasks]);

  const addMember = () => {
    setTeam((prev) => {
      const next = [...prev, { id: uid(), name: "" }];
      setWeeklyCapacity((current) => Math.max(current, next.length));
      return next;
    });
  };

  const removeMember = (memberId: string) => {
    setTeam((prev) => {
      const next = prev.filter((member) => member.id !== memberId);
      setWeeklyCapacity((current) => Math.max(1, Math.min(current, next.length || 1)));
      return next;
    });
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        qualifiedIds: (task.qualifiedIds || []).filter((id) => id !== memberId),
      }))
    );
  };

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        name: "",
        frequencyWeeks: 1,
        qualifiedIds: [],
        qualifiedNames: [],
        lastCompleted: "",
        assignEntireTeam: false,
      },
    ]);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleQualified = (taskId: string, memberId: string, checked: boolean) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextIds = checked
          ? Array.from(new Set([...(task.qualifiedIds || []), memberId]))
          : (task.qualifiedIds || []).filter((id) => id !== memberId);
        return { ...task, qualifiedIds: nextIds };
      })
    );
  };

  const generateSchedule = () => {
    setGenerated(
      buildSchedule({
        team,
        tasks,
        history,
        scheduleStart,
        weeklyCapacity,
      })
    );
  };

  const applyGeneratedToHistory = () => {
    if (!generated) return;

    const newRows: HistoryRow[] = generated.assignments
      .filter((assignment) => assignment.memberId)
      .map((assignment) => ({
        date: assignment.weekStart,
        taskId: assignment.taskId,
        taskName: assignment.taskName,
        memberId: assignment.memberId as string,
      }));

    setHistory((prev) => [...prev, ...newRows]);
    setTasks((prev) =>
      prev.map((task) => {
        const matchingRows = newRows.filter((row) => row.taskId === task.id);
        if (!matchingRows.length) return task;
        return { ...task, lastCompleted: matchingRows[matchingRows.length - 1].date };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Rotation Scheduler</h1>
            <p className="mt-1 text-sm text-slate-600">
              Zero-dependency UI version for easy Next.js deployment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={() => downloadJson("maintenance-config.json", { team, tasks, history })}>
              <Download className="h-4 w-4" /> Export config
            </SecondaryButton>
            <PrimaryButton onClick={generateSchedule}>
              <Shuffle className="h-4 w-4" /> Generate schedule
            </PrimaryButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <SectionCard title="Schedule settings">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start week</label>
                  <TextInput type="date" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Weekly task slots</label>
                  <TextInput
                    type="number"
                    min={1}
                    max={Math.max(team.length, 1)}
                    value={weeklyCapacity}
                    onChange={(e) => setWeeklyCapacity(Number(e.target.value || team.length || 1))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <TextArea value={seedNote} onChange={(e) => setSeedNote(e.target.value)} rows={5} />
                </div>
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                  <div className="font-medium">How assignments are chosen</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>The app generates one week at a time.</li>
                    <li>It tries to fill one task per person for that week.</li>
                    <li>Due and overdue tasks are chosen first.</li>
                    <li>If more tasks are due than the week can hold, the extras stay queued for later.</li>
                    <li>If fewer tasks are due, the app pulls in the next queued tasks so everyone still gets one assignment.</li>
                    <li>Among qualified members, the app favors whoever has fewer total assignments.</li>
                    <li>If there is still a tie, the app randomizes between those tied members.</li>
                    <li>Any task marked as a teamwide task assigns every team member for that week.</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Generated schedule"
              action={generated ? <SecondaryButton onClick={applyGeneratedToHistory}>Save generated schedule as completed history</SecondaryButton> : undefined}
            >
              {!generated ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Generate a schedule to see this week&apos;s assignments.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Week of {weekLabel(generated.weekStart)}</h3>
                    <Pill>{generated.assignments.length} assignment(s)</Pill>
                  </div>
                  <div className="space-y-2">
                    {generated.assignments.length === 0 ? (
                      <div className="text-sm text-slate-500">No assignments could be generated for this week.</div>
                    ) : (
                      generated.assignments.map((row, idx) => (
                        <div
                          key={`${row.taskId}-${row.memberId || idx}`}
                          className="grid gap-2 rounded-2xl border border-slate-200 p-3 md:grid-cols-[2fr_1fr_1fr] md:items-center"
                        >
                          <div>
                            <div className="font-medium">{row.taskName}</div>
                            <div className="text-xs text-slate-500">{row.note}</div>
                          </div>
                          <div className="text-sm text-slate-700">{row.memberName}</div>
                          <div className="text-xs text-slate-500">{row.memberId ? "Assigned" : "Needs setup"}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <SectionCard
              title="Team"
              action={
                <SecondaryButton onClick={addMember}>
                  <Plus className="h-4 w-4" /> Add member
                </SecondaryButton>
              }
            >
              <div className="space-y-3">
                {team.map((member, idx) => (
                  <div key={member.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[40px_1fr_40px] md:items-center">
                    <div className="text-sm font-medium text-slate-500">{idx + 1}</div>
                    <TextInput
                      placeholder="Team member name"
                      value={member.name}
                      onChange={(e) =>
                        setTeam((prev) => prev.map((item) => (item.id === member.id ? { ...item, name: e.target.value } : item)))
                      }
                    />
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Assignment totals">
              <div className="space-y-3">
                {stats.map((row) => (
                  <div key={row.name} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{row.name}</span>
                      <Pill>{row.count}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard
          title="Maintenance tasks"
          action={
            <SecondaryButton onClick={addTask}>
              <Plus className="h-4 w-4" /> Add task
            </SecondaryButton>
          }
        >
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[2fr_140px_180px_40px] lg:items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Task</label>
                    <TextInput
                      placeholder="Maintenance task"
                      value={task.name}
                      onChange={(e) =>
                        setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, name: e.target.value } : item)))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Frequency (weeks)</label>
                    <TextInput
                      type="number"
                      min={1}
                      value={task.frequencyWeeks}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((item) =>
                            item.id === task.id ? { ...item, frequencyWeeks: Number(e.target.value || 1) } : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last completed</label>
                    <TextInput
                      type="date"
                      value={task.lastCompleted}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((item) => (item.id === task.id ? { ...item, lastCompleted: e.target.value } : item))
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-slate-700">Qualified team members</label>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckInput
                        checked={Boolean(task.assignEntireTeam)}
                        onChange={(e) =>
                          setTasks((prev) =>
                            prev.map((item) =>
                              item.id === task.id ? { ...item, assignEntireTeam: e.target.checked } : item
                            )
                          )
                        }
                      />
                      Teamwide task
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {team.map((member) => {
                      const checked = (task.qualifiedIds || []).includes(member.id);
                      return (
                        <label
                          key={member.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm hover:bg-slate-50"
                        >
                          <CheckInput
                            checked={checked}
                            onChange={(e) => toggleQualified(task.id, member.id, e.target.checked)}
                          />
                          <span>{member.name || "Unnamed member"}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Scheduler self-checks">
          <div className="space-y-2">
            {testResults.map((result) => (
              <div key={result.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                <span>{result.name}</span>
                <Pill tone={result.passed ? "default" : "danger"}>{result.passed ? "Pass" : "Fail"}</Pill>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}