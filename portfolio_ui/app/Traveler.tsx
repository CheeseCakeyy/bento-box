type Pose = "stand" | "sit" | "sleep" | "sunbathe";

/** Original little paper traveler, drawn as articulated ink strokes. */
export default function Traveler({ pose = "stand" }: { pose?: Pose }) {
  const resting = pose === "sleep" || pose === "sunbathe";
  return (
    <svg className={`traveler traveler--${pose}`} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {pose === "sunbathe" && <g className="traveler-sun" stroke="currentColor" strokeWidth="1.2"><circle cx="78" cy="20" r="7" /><path d="M78 7v-3m0 32v-3M65 20h-3m32 0h-3M69 11l-2-2m20 20 2 2m-20-2-2 2m20-20 2-2" /></g>}
      {pose === "sleep" && <g className="traveler-dream" stroke="currentColor" strokeWidth="1.2"><path d="m69 27 6-1-5 7 6-1m4-17 8-1-6 9 8-1" /></g>}
      <g transform={resting ? "translate(0 18) rotate(-72 48 57)" : undefined}>
        <g className="traveler-body" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
          <path className="traveler-leg traveler-leg--back" d={pose === "sit" ? "M44 68 39 79 43 91 49 91" : resting ? "M45 68 36 80 28 82" : "M45 68 41 81 38 91 45 91"} />
          <path className="traveler-leg traveler-leg--front" d={pose === "sit" ? "M53 68 58 78 56 92 63 93" : resting ? "M53 68 57 80 68 87 73 85" : "M52 68 56 81 59 91 66 91"} />
          <path className="traveler-coat" d="M42 42Q48 39 54 43L59 65Q51 72 39 66Z" />
          <path d="m42 61 14 1M48 46l-1 10" opacity=".45" />
          <path className="traveler-arm traveler-arm--back" d={resting ? "M42 46 31 39 37 30" : "M42 46 34 58 31 68"} />
          <path className="traveler-arm traveler-arm--front" d={resting ? "M54 46 65 36 57 30" : "M54 46 62 57 67 63"} />
          <g className="traveler-head">
            <path className="traveler-paper" d="M38 25Q37 15 47 14Q58 14 58 26L61 30 57 32Q56 41 48 41Q39 39 38 25Z" />
            <path className="traveler-cap" d="M35 23Q33 11 46 10Q57 10 59 21L65 23Q50 27 34 25Z" />
            <path d="m39 16 3-2m-7 9 22-2" opacity=".4" />
            {resting ? <path d="m50 29 4 1" /> : <path className="traveler-eye" d="M53 29v1" />}
            <path d="m51 36 3-1" />
          </g>
          <path className="traveler-scarf-tail" d="M43 41Q32 44 26 38L28 45Q37 50 46 44" />
          <path className="traveler-scarf" d="m40 39 16 1-1 5-15-2Z" />
        </g>
      </g>
    </svg>
  );
}

export function RestingTraveler({ pose }: { pose: Exclude<Pose, "stand"> }) {
  return <span className={`card-traveler card-traveler--${pose}`} aria-hidden="true"><Traveler pose={pose} /></span>;
}
