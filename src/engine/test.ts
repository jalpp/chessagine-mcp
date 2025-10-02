import { MCPStockfish } from "./MCPStockfish.js";

(async () => {
    const engine = await MCPStockfish.create();
    await engine.init();

    const data = await engine.evaluatePositionWithUpdate({
        fen: "3r2k1/1p3qpp/p4p2/3r4/1P3P2/P3Q3/6PP/2R1R2K w - - 2 30",
        depth: 30,
        multiPv: 3
    })

    console.log(data);

    
})();
