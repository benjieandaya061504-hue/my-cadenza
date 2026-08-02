import express from "express";
import * as controller from "./course.controller.js";

const router = express.Router();


// =====================
// COURSE MODULES
// =====================

router.get(
    "/modules",
    controller.getCourseModules
);


router.get(
    "/modules/:id",
    controller.getCourseModuleById
);


router.post(
    "/modules",
    controller.createCourseModule
);


router.put(
    "/modules/:id",
    controller.updateCourseModule
);


router.delete(
    "/modules/:id",
    controller.deleteCourseModule
);


// =====================
// COURSES
// =====================

router.get(
    "/",
    controller.getCourses
);


router.get(
    "/:id",
    controller.getCourseById
);


router.post(
    "/",
    controller.createCourse
);


router.put(
    "/:id",
    controller.updateCourse
);


router.delete(
    "/:id",
    controller.deleteCourse
);


export default router;