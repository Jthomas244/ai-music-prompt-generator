"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { GENRES, MOODS, INSTRUMENTS, KEYS, MIN_BPM, MAX_BPM } from "@/lib/knowledge-base";
import { PRESETS } from "@/lib/presets";
import { InfluenceSearch } from "./InfluenceSearch";
import { FineTune } from "./FineTune";
import { Chip, Label, Slider, Waveform } from "./ui";
import type { Influence, Picks, Preset, PromptLength, UserPreset } from "@/lib/types";

const MAX_INFLUENCES = 5;

interface ControlPanelProps {
  picks: Picks;
  onChange: (patch: Partial<Picks>) => void;

  parsing: boolean;
  parseNote: string | null;
  parseError: string | null;
  onParse: () => void;

  customLibrary: Influence[];
  onAddCustom: (name: string) => Promise<boolean>;
  onRemoveCustom: (id: string) => void;
  addingCustom: boolean;

  userPresets: UserPreset[];
  activePresetId: string | null;
  onApplyPreset: (preset: Preset) => void;
  onApplyUserPreset: (preset: UserPreset) => void;
  onSaveUserPreset: (name: string) => void;
  onDeleteUserPreset: (id: string) => void;

  canGenerate: boolean;
  isStreaming: boolean;
  missingSelections: string;
  onGenerate: () => void;
}

const LENGTHS: { id: PromptLength; label: string }[] = [
  { id: "concise", label: "Concise · 40–70 words" },
  { id: "standard", label: "Standard · 70–120 words" },
  { id: "detailed", label: "Detailed · 120–180 words" },
];

export function ControlPanel({
  picks,
  onChange,
  parsing,
  parseNote,
  parseError,
  onParse,
  customLibrary,
  onAddCustom,
  onRemoveCustom,
  addingCustom,
  userPresets,
  activePresetId,
  onApplyPreset,
  onApplyUserPreset,
  onSaveUserPreset,
  onDeleteUserPreset,
  canGenerate,
  isStreaming,
  missingSelections,
  onGenerate,
}: ControlPanelProps) {
  const [presetName, setPresetName] = useState("");
  const [bpmDraft, setBpmDraft] = useState<string>(picks.bpm === null ? "" : String(picks.bpm));

  // Keep the BPM box in sync when a preset / parser / link sets it
  const bpmShown = picks.bpm === null ? bpmDraft : bpmDraft !== "" && Number(bpmDraft) === picks.bpm ? bpmDraft : String(picks.bpm);

  function commitBpm(raw: string) {
    setBpmDraft(raw);
    const n = Number(raw);
    if (raw === "" || !Number.isFinite(n)) {
      onChange({ bpm: null });
      return;
    }
    if (n >= MIN_BPM && n <= MAX_BPM) onChange({ bpm: Math.round(n) });
  }

  function handleShortcut(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canGenerate) {
      e.preventDefault();
      onGenerate();
    }
  }

  function toggleIn(list: string[], key: keyof Picks, max?: number) {
    return (id: string) => {
      if (list.includes(id)) onChange({ [key]: list.filter((x) => x !== id) } as Partial<Picks>);
      else if (max === undefined || list.length < max) onChange({ [key]: [...list, id] } as Partial<Picks>);
    };
  }

  const canParse = picks.notes.trim().length > 3 && !parsing;

  return (
    <div className="flex flex-col gap-5">
      {/* Describe the vibe */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="vibe">Describe the vibe</Label>
        <textarea
          id="vibe"
          rows={3}
          maxLength={800}
          value={picks.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          onKeyDown={handleShortcut}
          placeholder="Tapping, interlocking guitar lines over a steady kit — the feeling of homework at 1am."
          className="field resize-none"
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={onParse}
            disabled={!canParse}
            className="btn-outline btn-outline-sm"
            title="Claude reads your description and fills every control below"
          >
            {parsing ? <Waveform bars={3} height={11} /> : <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent2)" }} />}
            {parsing ? "Reading…" : "Fill controls from this"}
          </button>
          {parseError && <span className="text-[12px] text-[#E07A6A]">{parseError}</span>}
          {!parseError && parseNote && <span className="text-[12px] text-secondary">{parseNote}</span>}
        </div>
      </div>

      {/* Avoid */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="avoid">Avoid (optional)</Label>
        <input
          id="avoid"
          type="text"
          value={picks.avoid}
          onChange={(e) => onChange({ avoid: e.target.value })}
          onKeyDown={handleShortcut}
          maxLength={200}
          placeholder="vocals, distortion, major key"
          className="field"
        />
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2.5" id="presets">
        <Label>Presets</Label>
        <div className="flex flex-wrap gap-2">
          {userPresets.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              active={activePresetId === p.id}
              onClick={() => onApplyUserPreset(p)}
              tone="accent2"
              onRemove={() => onDeleteUserPreset(p.id)}
              removeLabel={`Delete preset ${p.name}`}
            />
          ))}
          {PRESETS.map((p) => (
            <Chip key={p.id} label={p.label} active={activePresetId === p.id} onClick={() => onApplyPreset(p)} tone="accent2" title={p.tagline} />
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSaveUserPreset(presetName.trim());
            setPresetName("");
          }}
        >
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            maxLength={40}
            placeholder="Name this setup…"
            className="field field-sm flex-1 min-w-0"
            aria-label="Preset name"
          />
          <button type="submit" className="btn-outline" disabled={!picks.genreId}>
            Save
          </button>
        </form>
      </div>

      {/* Genre */}
      <div className="flex flex-col gap-2.5">
        <Label>Genre</Label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              active={picks.genreId === g.id}
              onClick={() => onChange({ genreId: picks.genreId === g.id ? "" : g.id })}
              title={g.description}
            />
          ))}
        </div>
      </div>

      {/* Mood + feel */}
      <div className="flex flex-col gap-3">
        <Label>Mood</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              active={picks.moodId === m.id}
              onClick={() => onChange({ moodId: picks.moodId === m.id ? "" : m.id })}
              title={m.textures}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Slider id="energy" label="Energy" value={picks.feel.energy} onChange={(v) => onChange({ feel: { ...picks.feel, energy: v } })} />
          <Slider id="warmth" label="Warmth" value={picks.feel.warmth} onChange={(v) => onChange({ feel: { ...picks.feel, warmth: v } })} />
          <Slider id="complexity" label="Complexity" value={picks.feel.complexity} onChange={(v) => onChange({ feel: { ...picks.feel, complexity: v } })} />
        </div>
      </div>

      {/* Instrumentation */}
      <div className="flex flex-col gap-2.5">
        <Label aside={picks.instrumentIds.length ? `${picks.instrumentIds.length} selected` : undefined}>Instrumentation</Label>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map((i) => (
            <Chip
              key={i.id}
              label={i.label}
              active={picks.instrumentIds.includes(i.id)}
              onClick={() => toggleIn(picks.instrumentIds, "instrumentIds")(i.id)}
              tone="accent2"
            />
          ))}
        </div>
      </div>

      {/* BPM + key */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="bpm">BPM</Label>
          <input
            id="bpm"
            type="number"
            inputMode="numeric"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpmShown}
            onChange={(e) => commitBpm(e.target.value)}
            onKeyDown={handleShortcut}
            placeholder="88"
            className="field field-mono"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="key">Key</Label>
          <select id="key" value={picks.key} onChange={(e) => onChange({ key: e.target.value })} className="field field-mono">
            <option value="">Any</option>
            <optgroup label="Minor">
              {KEYS.filter((k) => k.id.endsWith("minor")).map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </optgroup>
            <optgroup label="Major">
              {KEYS.filter((k) => k.id.endsWith("major")).map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Influences */}
      <div className="flex flex-col gap-2.5">
        <Label aside={`${picks.influenceIds.length}/${MAX_INFLUENCES}`}>Sonic influences</Label>
        <InfluenceSearch
          selectedIds={picks.influenceIds}
          onToggle={toggleIn(picks.influenceIds, "influenceIds", MAX_INFLUENCES)}
          genreId={picks.genreId || undefined}
          max={MAX_INFLUENCES}
          customInfluences={customLibrary}
          onAddCustom={onAddCustom}
          onRemoveCustom={onRemoveCustom}
          addingCustom={addingCustom}
        />
      </div>

      {/* Fine-tune */}
      <FineTune
        selectedTimeSigs={picks.timeSignatureIds}
        onTimeSigsChange={(v) => onChange({ timeSignatureIds: v })}
        selectedChords={picks.chordVoicingIds}
        onChordsChange={(v) => onChange({ chordVoicingIds: v })}
        selectedTextures={picks.textures}
        onTexturesChange={(v) => onChange({ textures: v })}
      />

      {/* Length + platform */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="length">Length</Label>
          <select id="length" value={picks.promptLength} onChange={(e) => onChange({ promptLength: e.target.value as PromptLength })} className="field field-sm">
            {LENGTHS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="platform">Platform</Label>
          <select id="platform" value={picks.sunoMode ? "suno" : "any"} onChange={(e) => onChange({ sunoMode: e.target.value === "suno" })} className="field field-sm">
            <option value="suno">Suno-optimized</option>
            <option value="any">Any platform</option>
          </select>
        </div>
      </div>

      {/* Generate — sticky at the panel's bottom on desktop; mobile has the fixed bar */}
      <div className="hidden lg:flex flex-col gap-2 sticky -bottom-7 -mx-7 px-7 pt-3 pb-7 bg-panel border-t border-line">
        <div className="text-[11px] text-secondary text-center">
          {canGenerate ? "⌘ / Ctrl + Enter to generate" : isStreaming ? "Streaming…" : `Select ${missingSelections} to generate`}
        </div>
        <button type="button" onClick={onGenerate} disabled={!canGenerate} className="btn-primary flex items-center justify-center gap-2">
          {isStreaming ? (
            <>
              <Waveform bars={5} height={14} />
              Generating…
            </>
          ) : (
            "Generate Prompt"
          )}
        </button>
      </div>
    </div>
  );
}
