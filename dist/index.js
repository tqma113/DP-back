"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const app = new koa_1.default();
const router = new koa_router_1.default();
// Routes
router.get('/', async (ctx, next) => {
    ctx.body = {
        msg: 'Hello world!'
    };
    await next();
});
// Middleware
app.use(koa_json_1.default());
app.use(koa_logger_1.default());
app.use(koa_bodyparser_1.default());
// Router
app.use(router.routes()).use(router.allowedMethods());
app.listen(4000, () => {
    console.log('koa server started!');
});
//# sourceMappingURL=index.js.map