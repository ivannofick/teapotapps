import { Router } from "express";

export function routeGroup(parentRouter, prefix, middlewares = [], callback) {
    const groupRouter = Router();

    if (middlewares && middlewares.length > 0) {
        groupRouter.use(...middlewares);
    }

    callback(groupRouter);
    parentRouter.use(prefix, groupRouter);
}
