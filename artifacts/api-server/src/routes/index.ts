import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import timeslotsRouter from "./timeslots";
import ordersRouter from "./orders";
import executivesRouter from "./executives";
import reportsRouter from "./reports";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(timeslotsRouter);
router.use(ordersRouter);
router.use(executivesRouter);
router.use(reportsRouter);

export default router;
