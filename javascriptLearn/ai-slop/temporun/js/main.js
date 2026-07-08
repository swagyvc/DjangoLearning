import { GameEngine } from "./GameEngine.js";
import { UIManager } from "./UIManager.js";
import { SaveManager } from "./SaveManager.js";
import { SoundManager } from "./SoundManager.js";

const canvas = document.getElementById("gameCanvas");
const ui = new UIManager();
const save = new SaveManager();
const sound = new SoundManager();
const engine = new GameEngine(canvas, ui, save, sound);

function onResize() {
    engine.resize();
}

window.addEventListener("resize", onResize);
engine.start();
