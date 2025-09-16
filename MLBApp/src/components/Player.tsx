import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "src/@/components/ui/tabs";
import { Separator } from "src/@/components/ui/separator";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "src/@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Ruler,
  Scale,
  Hash,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

// Your existing table
import { StatsTable } from "./Table"; // (uses your splitColumns)

// ---------- Types from your API ----------
import type { Person, StatElement } from "../interfaces/generated.player.types";
import { formatYYYYMMDD, parseYMDLocal } from "../utils/utils";
import { buildSplitColumnsFromData } from "src/data/columnDefs";

// ---------- Small utils ----------
function headshotUrl(personId: number, res: 67 | 100 | 200 = 200) {
  // MLB headshot pattern (works for most players)
  return `https://img.mlbstatic.com/mlb-photos/image/upload/w_${res},q_auto:best/v1/people/${personId}/headshot/67/current`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ---------- Small UI atoms ----------
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="text-sm">
        <span className="text-muted-foreground mr-1">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
      {children}
    </Badge>
  );
}

// ---------- Header / Bio ----------
function PlayerHeader({ p }: { p: Person }) {
  const active = p.active;
  const bats = p.batSide?.description ?? "";
  const throws = p.pitchHand?.description ?? "";
  const pos = p.primaryPosition?.abbreviation ?? p.primaryPosition?.name ?? "";
  const number = p.primaryNumber ? `#${p.primaryNumber}` : undefined;

  return (
    <div className="flex items-center gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Avatar className="h-20 w-20 ring-2 ring-background shadow-sm">
          <AvatarImage
            src={headshotUrl(p.id)}
            alt={p.fullName}
            className="object-cover"
          />
          <AvatarFallback>{initials(p.fullName)}</AvatarFallback>
        </Avatar>
      </motion.div>

      <div className="flex-1 min-w-0">
        <CardTitle className="text-xl">{p.fullName}</CardTitle>
        <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
          {number && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Hash className="h-3.5 w-3.5" />
              {number}
            </span>
          )}
          <Chip>{pos || "—"}</Chip>
          <Chip>Bats: {bats || "—"}</Chip>
          <Chip>Throws: {throws || "—"}</Chip>
          {active ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Active
            </Badge>
          ) : (
            <Badge variant="destructive">
              <ShieldAlert className="mr-1 h-3.5 w-3.5" />
              Inactive
            </Badge>
          )}
        </CardDescription>
      </div>
    </div>
  );
}

function BioGrid({ p }: { p: Person }) {
  const birthplace = [p.birthCity, p.birthStateProvince, p.birthCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 md:grid-cols-3">
      <Fact
        icon={Calendar}
        label="Born"
        value={formatYYYYMMDD(parseYMDLocal(p.birthDate) as Date)}
      />
      <Fact
        icon={Calendar}
        label="MLB Debut"
        value={formatYYYYMMDD(parseYMDLocal(p.mlbDebutDate) as Date)}
      />
      <Fact icon={MapPin} label="Birthplace" value={birthplace} />
      <Fact icon={Ruler} label="Height" value={p.height} />
      <Fact
        icon={Scale}
        label="Weight"
        value={p.weight ? `${p.weight} lb` : ""}
      />
      <Fact icon={Hash} label="Age" value={p.currentAge} />
    </div>
  );
}

// ---------- Stats Tabs wrapper (uses your existing table) ----------
function PlayerStatsTabs({ stats }: { stats: StatElement[] }) {
  if (!stats?.length) return null;

  const groups = stats
    .filter((s) => s?.group?.displayName && Array.isArray(s.splits))
    .map((s) => ({
      key: `${s.group.displayName}-${s.type.displayName}`,
      label: `${s.group.displayName} • ${s.type.displayName}`,
      splits: s.splits,
    }));

  const first = groups[0]?.key;

  return (
    <Tabs defaultValue={first} className="w-full">
      <TabsList className="flex w-full flex-wrap justify-start gap-2">
        {groups.map((g) => (
          <TabsTrigger key={g.key} value={g.key} className="px-3">
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map((g) => {
        // 🔑 Build the columns from the data in THIS tab
        const cols = buildSplitColumnsFromData(g.splits);
        return (
          <TabsContent
            key={g.key}
            value={g.key}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-md border overflow-hidden">
              {/* keep your existing StatsTable behavior */}
              <StatsTable data={g.splits} columnDefs={cols} />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

// ---------- Main component ----------
export function PlayerProfile({ player }: { player: Person }) {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-10">
        <p className="text-red-500">No player found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full flex flex-co overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        <Card className="h-full flex flex-col rounded-none overflow-hidden">
          <CardHeader className="space-y-4">
            <PlayerHeader p={player} />
            <BioGrid p={player} />
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 min-h-0 min-w-full p-4 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="space-y-4 h-full min-h-0"
            >
              <div className="h-full w-full min-h-0">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Career Stats
                </h3>
                <PlayerStatsTabs stats={player.stats || []} />
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
