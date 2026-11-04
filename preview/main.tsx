import type { Expression } from "@mobyuz/moby-protocol";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { EXPRESSION_META, FACE_EXPRESSIONS, MobyFace } from "../src/index";
import "../src/styles.css";
import "./preview.css";

type Theme = "auto" | "light" | "dark";
type Motion = "auto" | "reduced" | "full";

function Preview() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [motion, setMotion] = useState<Motion>("auto");
  const reducedMotion = motion === "auto" ? undefined : motion === "reduced";
  return (
    <main className="page" data-theme={theme}>
      <h1>Moby face</h1>
      <p className="note">Every expression from moby-protocol, drawn by the component source in src/.</p>
      <div className="controls">
        <label>
          Theme{" "}
          <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
            <option value="auto">Follow system</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Motion{" "}
          <select value={motion} onChange={(event) => setMotion(event.target.value as Motion)}>
            <option value="auto">Follow system</option>
            <option value="reduced">Reduced</option>
            <option value="full">Full</option>
          </select>
        </label>
      </div>
      <ul className="grid">
        {FACE_EXPRESSIONS.map((expression) => (
          <li key={expression} data-testid={`tile-${expression}`}>
            <MobyFace expression={expression} theme={theme} reducedMotion={reducedMotion} />
            <span className="name">{expression}</span>
            <span className="status">{EXPRESSION_META[expression].status}</span>
          </li>
        ))}
        <li data-testid="tile-unknown">
          <MobyFace expression={"from-the-future" as Expression} theme={theme} reducedMotion={reducedMotion} />
          <span className="name">unknown value</span>
          <span className="status">Drawn as error</span>
        </li>
      </ul>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Preview />
    </StrictMode>,
  );
}
