import express from "express";
import * as controller from "./instructor.controller.js";

const router = express.Router();


// INSTRUCTORS

router.get(
    "/",
    controller.getAll
);

router.get(
    "/:id",
    controller.getById
);

router.post(
    "/",
    controller.create
);

router.put(
    "/:id",
    controller.update
);

router.delete(
    "/:id",
    controller.remove
);

// INSTRUCTOR SCHEDULES

router.get(
    "/:id/schedules",
    controller.getSchedules
);

router.post(
    "/:id/schedules",
    controller.createSchedule
);

router.put(
    "/:id/schedules/:scheduleId",
    controller.updateSchedule
);

router.delete(
    "/:id/schedules/:scheduleId",
    controller.removeSchedule
);

export default router;