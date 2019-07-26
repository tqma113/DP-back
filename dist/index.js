import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
const app = new Koa();
const router = new Router();
// Routes
router.get('/', async (ctx, next) => {
    ctx.body = {
        msg: 'Hello world!'
    };
    await next();
});
// Middleware
app.use(json());
app.use(logger());
app.use(bodyParser());
// Router
app.use(router.routes()).use(router.allowedMethods());
app.listen(4000, () => {
    console.log('koa server started!');
});
//# sourceMappingURL=index.js.map