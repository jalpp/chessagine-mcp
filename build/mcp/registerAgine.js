import { registerAgineSystemPrompt } from "./agineSystemPromptRegister.js";
import { registerLichessTools } from "./lichessToolRegister.js";
import { registerRenderingTools } from "./renderToolRegister.js";
import { registerStateTools } from "./stateToolRegister.js";
import { registerStockfishTools } from "./stockfishToolRegister.js";
import { registerThemeCalculationTools } from "./themeToolRegister.js";
import { registerUtilsTools } from "./utilToolRegister.js";
export function registerAgine(server) {
    registerAgineSystemPrompt(server);
    registerLichessTools(server);
    registerRenderingTools(server);
    registerStateTools(server);
    registerStockfishTools(server);
    registerThemeCalculationTools(server);
    registerUtilsTools(server);
}
