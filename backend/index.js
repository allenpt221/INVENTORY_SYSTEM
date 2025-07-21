"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
app.get('/', (_req, res) => {
    res.send('Hello from Express + TypeScript (backend/)');
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
