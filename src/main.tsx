import { createRoot } from "react-dom/client";
import { NightWalk } from "./night/NightWalk";
import "@fontsource/press-start-2p/latin-400.css";
import "@fontsource/vt323/latin-400.css";
import "@fontsource/pixelify-sans/latin-400.css";
import "./night/night.css";
createRoot(document.getElementById("root")!).render(<NightWalk />);
