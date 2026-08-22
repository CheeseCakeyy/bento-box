"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";

type PipelineId = "rag" | "ml" | "agile";
type PipelineModule = { id: string; label: string; shortLabel: string };
type PipelineDefinition = {
  id: PipelineId;
  label: string;
  description: string;
  completionMessage: string;
  modules: PipelineModule[];
  initialOrder: string[];
};

const PIPELINES: PipelineDefinition[] = [
  {
    id: "rag",
    label: "RAG pipeline",
    description: "Put the retrieval system in the correct order.",
    completionMessage: "Pipeline online — retrieval flow complete.",
    modules: [
      { id: "rag-query", label: "User query", shortLabel: "Query" },
      { id: "rag-embed", label: "Embed query", shortLabel: "Embed" },
      { id: "rag-search", label: "Vector search", shortLabel: "Search" },
      { id: "rag-retrieve", label: "Retrieve context", shortLabel: "Retrieve" },
      { id: "rag-augment", label: "Compose prompt", shortLabel: "Augment" },
      { id: "rag-generate", label: "Generate answer", shortLabel: "Generate" },
    ],
    initialOrder: ["rag-generate", "rag-search", "rag-query", "rag-augment", "rag-embed", "rag-retrieve"],
  },
  {
    id: "ml",
    label: "ML model lifecycle",
    description: "Arrange the model development lifecycle.",
    completionMessage: "Lifecycle complete — model ready to monitor.",
    modules: [
      { id: "ml-collect", label: "Collect data", shortLabel: "Collect" },
      { id: "ml-prepare", label: "Prepare data", shortLabel: "Prepare" },
      { id: "ml-split", label: "Split dataset", shortLabel: "Split" },
      { id: "ml-train", label: "Train model", shortLabel: "Train" },
      { id: "ml-evaluate", label: "Evaluate model", shortLabel: "Evaluate" },
      { id: "ml-deploy", label: "Deploy & monitor", shortLabel: "Deploy" },
    ],
    initialOrder: ["ml-train", "ml-collect", "ml-deploy", "ml-split", "ml-evaluate", "ml-prepare"],
  },
  {
    id: "agile",
    label: "Agile development lifecycle",
    description: "Arrange one complete agile iteration.",
    completionMessage: "Sprint complete — ready for the next iteration.",
    modules: [
      { id: "agile-plan", label: "Plan", shortLabel: "Plan" },
      { id: "agile-design", label: "Design", shortLabel: "Design" },
      { id: "agile-develop", label: "Develop", shortLabel: "Develop" },
      { id: "agile-test", label: "Test", shortLabel: "Test" },
      { id: "agile-deploy", label: "Deploy", shortLabel: "Deploy" },
      { id: "agile-review", label: "Review & iterate", shortLabel: "Review" },
    ],
    initialOrder: ["agile-test", "agile-plan", "agile-review", "agile-develop", "agile-deploy", "agile-design"],
  },
];

const CONNECTORS = [
  { id: 1, from: 0, to: 1, glyph: "→" },
  { id: 2, from: 1, to: 2, glyph: "↓" },
  { id: 3, from: 2, to: 3, glyph: "←" },
  { id: 4, from: 3, to: 4, glyph: "↓" },
  { id: 5, from: 4, to: 5, glyph: "→" },
] as const;

function shuffleModules(modules: string[]) {
  const shuffled = [...modules];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }
  return shuffled;
}

function getPipeline(pipelineId: PipelineId) {
  return PIPELINES.find((pipeline) => pipeline.id === pipelineId) ?? PIPELINES[0];
}

export default function PipelineBuilder() {
  const [pipelineId, setPipelineId] = useState<PipelineId>("rag");
  const activePipeline = useMemo(() => getPipeline(pipelineId), [pipelineId]);
  const [slots, setSlots] = useState<Array<string | null>>(() => Array(getPipeline("rag").modules.length).fill(null));
  const [moduleOrder, setModuleOrder] = useState<string[]>(() => getPipeline("rag").initialOrder);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [lastPlacedSlot, setLastPlacedSlot] = useState<number | null>(null);
  const [status, setStatus] = useState("Select a module, then choose its position.");
  const feedbackTimerRef = useRef<number | null>(null);

  const placedModules = useMemo(
    () => new Set(slots.filter((slot): slot is string => slot !== null)),
    [slots],
  );
  const placedCount = placedModules.size;
  const complete = placedCount === activePipeline.modules.length;

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

  const placeModule = (moduleId: string, slotIndex: number) => {
    if (slots[slotIndex] !== null || placedModules.has(moduleId)) return;
    const expectedModule = activePipeline.modules[slotIndex];

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
        ? activePipeline.completionMessage
        : `${expectedModule.label} locked into stage ${String(slotIndex + 1).padStart(2, "0")}.`,
    );
    clearFeedbackAfter(620);
  };

  const resetPipeline = () => {
    setSlots(Array(activePipeline.modules.length).fill(null));
    setModuleOrder((currentOrder) => shuffleModules(currentOrder));
    setSelectedModule(null);
    setDraggedModule(null);
    setHoveredSlot(null);
    setWrongSlot(null);
    setLastPlacedSlot(null);
    setStatus(`Modules shuffled. Rebuild the ${activePipeline.label.toLowerCase()}.`);
  };

  const changePipeline = (nextPipelineId: PipelineId) => {
    const nextPipeline = getPipeline(nextPipelineId);
    setPipelineId(nextPipelineId);
    setSlots(Array(nextPipeline.modules.length).fill(null));
    setModuleOrder(nextPipeline.initialOrder);
    setSelectedModule(null);
    setDraggedModule(null);
    setHoveredSlot(null);
    setWrongSlot(null);
    setLastPlacedSlot(null);
    setStatus(`New challenge loaded. Build the ${nextPipeline.label.toLowerCase()}.`);
  };

  const onModuleDragStart = (event: DragEvent<HTMLButtonElement>, moduleId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", moduleId);
    setDraggedModule(moduleId);
    setSelectedModule(moduleId);
    setStatus(`${activePipeline.modules.find((module) => module.id === moduleId)?.label} selected — choose a slot.`);
  };

  const onSlotDrop = (event: DragEvent<HTMLButtonElement>, slotIndex: number) => {
    event.preventDefault();
    const droppedValue = event.dataTransfer.getData("text/plain");
    setDraggedModule(null);
    setHoveredSlot(null);
    if (activePipeline.modules.some((module) => module.id === droppedValue)) {
      placeModule(droppedValue, slotIndex);
    }
  };

  const renderSlot = (slotIndex: number) => {
    const placedId = slots[slotIndex];
    const module = placedId ? activePipeline.modules.find((item) => item.id === placedId) : null;
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
        <span>{complete ? "Pipeline online" : `${placedCount} / ${activePipeline.modules.length} placed`}</span>
      </header>

      <div className="pipeline-builder__intro">
        <select
          value={pipelineId}
          aria-label="Choose a pipeline challenge"
          onChange={(event) => changePipeline(event.target.value as PipelineId)}
        >
          {PIPELINES.map((pipeline) => (
            <option key={pipeline.id} value={pipeline.id}>{pipeline.label}</option>
          ))}
        </select>
        <span>{activePipeline.description}</span>
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
            <button type="button" onClick={resetPipeline} aria-label={`Reset and shuffle the ${activePipeline.label}`}>
              Reset ↻
            </button>
          </header>

          <div className="module-tray__modules" aria-label={`Shuffled ${activePipeline.label} modules`}>
            {moduleOrder.map((moduleId) => {
              const module = activePipeline.modules.find((item) => item.id === moduleId)!;
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

      {complete && (
        <div className="pipeline-celebration" aria-hidden="true">
          <span className="pipeline-celebration__popper pipeline-celebration__popper--left">🎉</span>
          <span className="pipeline-celebration__popper pipeline-celebration__popper--right">🎉</span>
          {Array.from({ length: 30 }, (_, index) => {
            const fromLeft = index % 2 === 0;
            const style = {
              left: fromLeft ? "15%" : "85%",
              "--confetti-x": `${(fromLeft ? 1 : -1) * (45 + ((index * 29) % 210))}px`,
              "--confetti-y": `${-90 - ((index * 37) % 230)}px`,
              "--confetti-r": `${180 + ((index * 73) % 540)}deg`,
              "--confetti-delay": `${(index % 8) * 34}ms`,
            } as CSSProperties;
            return <span key={index} className={`pipeline-confetti pipeline-confetti--${(index % 5) + 1}`} style={style} />;
          })}
        </div>
      )}
    </article>
  );
}
