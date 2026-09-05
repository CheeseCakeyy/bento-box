"use client";

import { useEffect, useRef } from "react";

const experiments = [
  { label: "No ES", oof: null, publicLb: 0.93249, privateLb: 0.93265 },
  { label: "Baseline", oof: 0.8955, publicLb: 0.93576, privateLb: 0.93609 },
  { label: "EDA LGBM", oof: 0.89754, publicLb: 0.93576, privateLb: 0.93609 },
  { label: "XGB Group", oof: 0.92978, publicLb: 0.94834, privateLb: 0.94878 },
  { label: "XGB FE", oof: 0.950752, publicLb: 0.95032, privateLb: 0.95068 },
  { label: "LGBM FE", oof: 0.952511, publicLb: 0.95237, privateLb: 0.95256 },
  { label: "RealMLP FE", oof: 0.953105, publicLb: 0.95259, privateLb: 0.95315 },
  { label: "Blend", oof: 0.953876, publicLb: 0.95328, privateLb: 0.95369 },
];

const series = [
  { key: "oof", cssColor: "--f1-oof" },
  { key: "publicLb", cssColor: "--f1-public" },
  { key: "privateLb", cssColor: "--f1-private" },
] as const;

export default function F1ScoreGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const chart = chartRef.current;
    if (!canvas || !chart) return;

    const draw = () => {
      const context = canvas.getContext("2d");
      if (!context) return;

      const width = chart.clientWidth;
      const height = chart.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const styles = getComputedStyle(chart);
      const gridColor = styles.borderColor;
      const surfaceColor = styles.backgroundColor;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const yMin = 0.89;
      const yMax = 0.96;
      const x = (index: number) => ((index + 0.5) / experiments.length) * width;
      const y = (score: number) => 4 + ((yMax - score) / (yMax - yMin)) * (height - 8);

      context.save();
      context.strokeStyle = gridColor;
      context.lineWidth = 1;
      context.setLineDash([3, 4]);
      [0.9, 0.92, 0.94, 0.96].forEach((tick) => {
        context.beginPath();
        context.moveTo(0, y(tick));
        context.lineTo(width, y(tick));
        context.stroke();
      });
      context.restore();

      series.forEach(({ key, cssColor }, seriesIndex) => {
        const color = styles.getPropertyValue(cssColor).trim();
        context.save();
        context.strokeStyle = color;
        context.lineWidth = seriesIndex === 2 ? 2.1 : 1.35;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();

        let hasStarted = false;
        experiments.forEach((experiment, index) => {
          const score = experiment[key];
          if (score === null) return;
          if (!hasStarted) {
            context.moveTo(x(index), y(score));
            hasStarted = true;
          } else {
            context.lineTo(x(index), y(score));
          }
        });
        context.stroke();

        experiments.forEach((experiment, index) => {
          const score = experiment[key];
          if (score === null) return;
          context.beginPath();
          context.arc(x(index), y(score), seriesIndex === 2 ? 3 : 2.25, 0, Math.PI * 2);
          context.fillStyle = surfaceColor;
          context.fill();
          context.strokeStyle = color;
          context.lineWidth = seriesIndex === 2 ? 1.8 : 1.25;
          context.stroke();
        });
        context.restore();
      });
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(chart);
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-color-theme"],
    });

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className="f1-line-graph" aria-label="Score progression from the earliest saved F1 pit-stop prediction run to the best saved blend">
      <div className="f1-line-graph__heading">
        <strong>ROC AUC / experiment progression</strong>
        <div className="f1-line-graph__legend" aria-hidden="true">
          <span><i className="is-oof" />OOF</span>
          <span><i className="is-public" />Public</span>
          <span><i className="is-private" />Private</span>
        </div>
      </div>
      <div className="f1-line-graph__body">
        <div className="f1-line-graph__y-axis" aria-hidden="true">
          <span>0.96</span><span>0.94</span><span>0.92</span><span>0.90</span>
        </div>
        <div className="f1-line-graph__plot-wrap">
          <div className="f1-line-graph__plot" ref={chartRef}>
            <canvas ref={canvasRef} aria-hidden="true" />
          </div>
          <div className="f1-line-graph__x-axis" aria-hidden="true">
            {experiments.map((experiment) => <span key={experiment.label}>{experiment.label}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
