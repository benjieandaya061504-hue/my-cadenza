import { Router } from "express";

import authRoute from "./auth/auth.route.js";
import instructorRoute from "./instructors/instructor.routes.js";
import courseRoute from "./course/course.routes.js";


const router = Router();


router.use("/auth", authRoute);

router.use("/instructors", instructorRoute);

router.use("/courses", courseRoute);


export default router;