"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";

const PIPELINE_MODULES = [
  { id: "query", label: "User query", shortLabel: "Query" },
  { id: "embed", label: "Embed query", shortLabel: "Embed" },
  { id: "search", label: "Vector search", shortLabel: "Search" },
  { id: "retrieve", label: "Retrieve context", shortLabel: "Retrieve" },
  { id: "augment", label: "Compose prompt", shortLabel: "Augment" },
  { id: "generate", label: "Generate answer", shortLabel: "Generate" },
] as const;

type ModuleId = (typeof PIPELINE_MODULES)[number]["id"];

const INITIAL_ORDER: ModuleId[] = ["generate", "search", "query", "augment", "embed", "retrieve"];
const CONNECTORS = [
  { id: 1, from: 0, to: 1, glyph: "→" },
  { id: 2, from: 1, to: 2, glyph: "↓" },
  { id: 3, from: 2, to: 3, glyph: "←" },
  { id: 4, from: 3, to: 4, glyph: "↓" },
  { id: 5, from: 4, to: 5, glyph: "→" },
] as const;

function shuffleModules(modules: ModuleId[]) {
  const shuffled = [...modules];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }
  return shuffled;
}

function isModuleId(value: string): value is ModuleId {
  return PIPELINE_MODULES.some((module) => module.id === value);
}

export default function PipelineBuilder() {
  const [slots, setSlots] = useState<Array<ModuleId | null>>(() => Array(PIPELINE_MODULES.length).fill(null));
  const [moduleOrder, setModuleOrder] = useState<ModuleId[]>(INITIAL_ORDER);
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [draggedModule, setDraggedModule] = useState<ModuleId | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [lastPlacedSlot, setLastPlacedSlot] = useState<number | null>(null);
  const [status, setStatus] = useState("Select a module, then choose its position.");
  const feedbackTimerRef = useRef<number | null>(null);

  const placedModules = useMemo(
    () => new Set(slots.filter((slot): slot is ModuleId => slot !== null)),
    [slots],
  );
  const placedCount = placedModules.size;
  const complete = placedCount === PIPELINE_MODULES.length;

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  const clearFeedbackAfter = (duration: number) => {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setWrongSlot(null);
      setLastPlacedSlot(null);
      feedbackTimerRef.current = null;
    }, duration);
  };

  const placeModule = (moduleId: ModuleId, slotIndex: number) => {
    if (slots[slotIndex] !== null || placedModules.has(moduleId)) return;
    const expectedModule = PIPELINE_MODULES[slotIndex];

    if (expectedModule.id !== moduleId) {
      setWrongSlot(slotIndex);
      setLastPlacedSlot(null);
      setStatus("Not there — trace the data flow and try another slot.");
      clearFeedbackAfter(520);
      return;
    }

    const nextSlots = [...slots];
    nextSlots[slotIndex] = moduleId;
    const isNowComplete = nextSlots.every((slot) => slot !== null);
    setSlots(nextSlots);
    setSelectedModule(null);
    setWrongSlot(null);
    setLastPlacedSlot(slotIndex);
    setStatus(
      isNowComplete
        ? "Pipeline online — retrieval flow complete."
        : `${expectedModule.label} locked into stage ${String(slotIndex + 1).padStart(2, "0")}.`,
    );
    clearFeedbackAfter(620);
  };

  const resetPipeline = () => {
    setSlots(Array(PIPELINE_MODULES.length).fill(null));
    setModuleOrder((currentOrder) => shuffleModules(currentOrder));
    setSelectedModule(null);
    setDraggedModule(null);
    setHoveredSlot(null);
    setWrongSlot(null);
    setLastPlacedSlot(null);
    setStatus("Modules shuffled. Rebuild the retrieval flow.");
  };

  const onModuleDragStart = (event: DragEvent<HTMLButtonElement>, moduleId: ModuleId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", moduleId);
    setDraggedModule(moduleId);
    setSelectedModule(moduleId);
    setStatus(`${PIPELINE_MODULES.find((module) => module.id === moduleId)?.label} selected — choose a slot.`);
  };

  const onSlotDrop = (event: DragEvent<HTMLButtonElement>, slotIndex: number) => {
    event.preventDefault();
    const droppedValue = event.dataTransfer.getData("text/plain");
    setDraggedModule(null);
    setHoveredSlot(null);
    if (isModuleId(droppedValue)) placeModule(droppedValue, slotIndex);
  };

  const renderSlot = (slotIndex: number) => {
    const placedId = slots[slotIndex];
    const module = placedId ? PIPELINE_MODULES.find((item) => item.id === placedId) : null;
    const position = slotIndex + 1;

    return (
      <button
        key={`slot-${position}`}
        className={`pipeline-slot pipeline-slot--${position} ${module ? "is-filled" : ""} ${wrongSlot === slotIndex ? "is-wrong" : ""} ${lastPlacedSlot === slotIndex ? "is-locking" : ""} ${hoveredSlot === slotIndex ? "is-hovered" : ""}`}
        type="button"
        aria-label={
          module
            ? `Stage ${position}: ${module.label}, correctly placed`
            : `Empty stage ${position}${selectedModule ? `. Place ${selectedModule} here` : ""}`
        }
        disabled={Boolean(module)}
        onClick={() => {
          if (selectedModule) placeModule(selectedModule, slotIndex);
          else setStatus("Choose a module from the tray first.");
        }}
        onDragEnter={(event) => {
          if (module) return;
          event.preventDefault();
          setHoveredSlot(slotIndex);
        }}
        onDragOver={(event) => {
          if (module) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDragLeave={() => setHoveredSlot((currentSlot) => (currentSlot === slotIndex ? null : currentSlot))}
        onDrop={(event) => onSlotDrop(event, slotIndex)}
      >
        <span>{String(position).padStart(2, "0")}</span>
        <strong>{module?.label ?? "Empty module"}</strong>
        <small>{module ? "Locked" : selectedModule ? "Place here" : "Awaiting input"}</small>
      </button>
    );
  };

  return (
    <article className="panel panel--code pipeline-builder" aria-labelledby="pipeline-builder-title">
      <header className="pipeline-builder__header">
        <h2 id="pipeline-builder-title">Build the flow</h2>
        <span>{complete ? "Pipeline online" : `${placedCount} / ${PIPELINE_MODULES.length} placed`}</span>
      </header>

      <div className="pipeline-builder__intro">
        <strong>RAG pipeline</strong>
        <span>Put the retrieval system in the correct order.</span>
      </div>

      <div className="pipeline-builder__workspace">
        <div className={`pipeline-map ${complete ? "is-complete" : ""}`}>
          {renderSlot(0)}
          {CONNECTORS.slice(0, 1).map((connector) => (
            <span key={connector.id} className={`pipeline-connector pipeline-connector--${connector.id} ${slots[connector.from] && slots[connector.to] ? "is-active" : ""}`} aria-hidden="true">
              {connector.glyph}
            </span>
          ))}
          {renderSlot(1)}
          {CONNECTORS.slice(1, 2).map((connector) => (
            <span key={connector.id} className={`pipeline-connector pipeline-connector--${connector.id} ${slots[connector.from] && slots[connector.to] ? "is-active" : ""}`} aria-hidden="true">
              {connector.glyph}
            </span>
          ))}
          {renderSlot(2)}
          {CONNECTORS.slice(2, 3).map((connector) => (
            <span key={connector.id} className={`pipeline-connector pipeline-connector--${connector.id} ${slots[connector.from] && slots[connector.to] ? "is-active" : ""}`} aria-hidden="true">
              {connector.glyph}
            </span>
          ))}
          {renderSlot(3)}
          {CONNECTORS.slice(3, 4).map((connector) => (
            <span key={connector.id} className={`pipeline-connector pipeline-connector--${connector.id} ${slots[connector.from] && slots[connector.to] ? "is-active" : ""}`} aria-hidden="true">
              {connector.glyph}
            </span>
          ))}
          {renderSlot(4)}
          {CONNECTORS.slice(4, 5).map((connector) => (
            <span key={connector.id} className={`pipeline-connector pipeline-connector--${connector.id} ${slots[connector.from] && slots[connector.to] ? "is-active" : ""}`} aria-hidden="true">
              {connector.glyph}
            </span>
          ))}
          {renderSlot(5)}
        </div>

        <section className="module-tray" aria-labelledby="module-tray-title">
        <header className="module-tray__header">
          <h2 id="module-tray-title">Module tray</h2>
          <button type="button" onClick={resetPipeline} aria-label="Reset and shuffle the RAG pipeline">
            Reset ↻
          </button>
        </header>

        <div className="module-tray__modules" aria-label="Shuffled RAG pipeline modules">
          {moduleOrder.map((moduleId) => {
            const module = PIPELINE_MODULES.find((item) => item.id === moduleId)!;
            const isPlaced = placedModules.has(moduleId);
            const isSelected = selectedModule === moduleId;

            return (
              <button
                key={moduleId}
                className={`${isPlaced ? "is-placed" : ""} ${isSelected ? "is-selected" : ""} ${draggedModule === moduleId ? "is-dragging" : ""}`}
                type="button"
                draggable={!isPlaced}
                disabled={isPlaced}
                aria-pressed={isSelected}
                title={module.label}
                onClick={() => {
                  const nextSelection = isSelected ? null : moduleId;
                  setSelectedModule(nextSelection);
                  setStatus(
                    nextSelection
                      ? `${module.label} selected — choose a slot.`
                      : "Selection cleared. Choose another module.",
                  );
                }}
                onDragStart={(event) => onModuleDragStart(event, moduleId)}
                onDragEnd={() => {
                  setDraggedModule(null);
                  setHoveredSlot(null);
                }}
              >
                <span aria-hidden="true">{isPlaced ? "✓" : "⋮⋮"}</span>
                <strong>{module.shortLabel}</strong>
              </button>
            );
          })}
        </div>

        <p className="module-tray__status" aria-live="polite">{status}</p>
        </section>
      </div>

      <p className="pipeline-builder__hint">Drag a module into the flow, or tap it and choose an empty stage.</p>
    </article>
  );
}
