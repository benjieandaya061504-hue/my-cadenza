import db from "../../db.js";

// ============================
// COURSE MODULES
// ============================

export async function getCourseModules() {
  const [rows] = await db.query(
    `
        SELECT *
        FROM course_modules
        ORDER BY course_module_id
        `
  );

  return rows;
}

export async function getCourseModuleById(id) {
  const [rows] = await db.query(
    `
        SELECT *
        FROM course_modules
        WHERE course_module_id=?
        `,
    [id]
  );

  return rows[0];
}

export async function createCourseModule(data) {
  const { course_module } = data;

  if (!course_module) {
    throw new Error("course_module is required");
  }

  const [result] = await db.query(
    `
        INSERT INTO course_modules
        (
            course_module
        )
        VALUES (?)
        `,
    [course_module]
  );

  return {
    course_module_id: result.insertId,
  };
}

// ============================
// COURSES
// ============================

export async function getCourses() {
  const [rows] = await db.query(
    `
        SELECT
            courses.course_id,
            courses.course,
            courses.course_module_id,
            course_modules.course_module

        FROM courses

        INNER JOIN course_modules

        ON course_modules.course_module_id =
           courses.course_module_id

        ORDER BY courses.course_id
        `
  );

  return rows;
}

export async function getCourseById(id) {
  const [rows] = await db.query(
    `
        SELECT
            courses.course_id,
            courses.course,
            courses.course_module_id,
            course_modules.course_module

        FROM courses

        INNER JOIN course_modules

        ON course_modules.course_module_id =
           courses.course_module_id

        WHERE courses.course_id=?
        `,
    [id]
  );

  return rows[0];
}

export async function createCourse(data) {

    const {
        course,
        course_module_id
    } = data;


    if (!course) {
        throw new Error("course is required");
    }


    if (!course_module_id) {
        throw new Error("course_module_id is required");
    }


    const [result] = await db.query(
        `
        INSERT INTO courses
        (
            course,
            course_module_id
        )
        VALUES (?,?)
        `,
        [
            course,
            course_module_id
        ]
    );


    return {
        course_id: result.insertId
    };
}

export async function updateCourse(id, data) {
  const { course, course_module_id } = data;

  await db.query(
    `
        UPDATE courses

        SET
            course=?,
            course_module_id=?,
            updated_at=CURRENT_TIMESTAMP

        WHERE course_id=?
        `,
    [course, course_module_id, id]
  );

  return getCourseById(id);
}

export async function deleteCourse(id) {
  await db.query(
    `
        DELETE FROM courses
        WHERE course_id=?
        `,
    [id]
  );
}
