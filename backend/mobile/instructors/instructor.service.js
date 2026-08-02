import pool from '../../db.js'

export async function getAll(){

    const [rows] = await db.query(
        `
        SELECT 
            instructors.*,
            courses.course
        FROM instructors

        JOIN courses
        ON courses.course_id = instructors.course_id
        `
    );
    return rows;
}

export async function getById(id){

    const [rows] = await db.query(
        `
        SELECT
            instructors.*,
            courses.course
        FROM instructors

        JOIN courses
        ON courses.course_id = instructors.course_id

        WHERE instructor_id=?
        `,
        [id]
    );

    return rows[0];
}

export async function create(data){

    const {
        course_id,
        staff_id
    } = data;


    const [result] = await db.query(
        `
        INSERT INTO instructors
        (
            course_id,
            staff_id
        )

        VALUES (?,?)
        `,
        [
            course_id,
            staff_id
        ]
    );


    return {
        instructor_id:result.insertId
    };

}

export async function update(id,data){

    const {
        course_id,
        staff_id
    } = data;

    await db.query(
        `
        UPDATE instructors

        SET
            course_id=?,
            staff_id=?,
            updated_at=CURRENT_TIMESTAMP

        WHERE instructor_id=?
        `,
        [
            course_id,
            staff_id,
            id
        ]
    );

    return getById(id);

}

export async function remove(id){

    await db.query(
        `
        DELETE FROM instructors

        WHERE instructor_id=?
        `,
        [id]
    );

}

// SCHEDULES

export async function getSchedules(instructorId){

    const [rows] = await db.query(
        `
        SELECT *

        FROM instructor_schedules

        WHERE instructor_id=?
        `,
        [
            instructorId
        ]
    );

    return rows;

}

export async function createSchedule(
    instructorId,
    data
){

    const {

        enrollment_id,
        sess_room_id,
        session_start_time,
        session_end_time,
        is_active

    } = data;

    const [result] = await db.query(
        `
        INSERT INTO instructor_schedules

        (
            instructor_id,
            enrollment_id,
            sess_room_id,
            session_start_time,
            session_end_time,
            is_active
        )

        VALUES (?,?,?,?,?,?)

        `,
        [

            instructorId,
            enrollment_id,
            sess_room_id,
            session_start_time,
            session_end_time,
            is_active ?? true

        ]
    );

    return {
        instructor_schedule_id:
        result.insertId
    };

}

export async function updateSchedule(
    scheduleId,
    instructorId,
    data
){

    const {

        enrollment_id,
        sess_room_id,
        session_start_time,
        session_end_time,
        is_active

    } = data;

    await db.query(
        `
        UPDATE instructor_schedules

        SET

            enrollment_id=?,
            sess_room_id=?,
            session_start_time=?,
            session_end_time=?,
            is_active=?,
            updated_at=CURRENT_TIMESTAMP


        WHERE instructor_schedule_id=?

        AND instructor_id=?

        `,
        [

            enrollment_id,
            sess_room_id,
            session_start_time,
            session_end_time,
            is_active,
            scheduleId,
            instructorId

        ]
    );

    return getSchedules(instructorId);

}

export async function removeSchedule(
    scheduleId,
    instructorId
){

    await db.query(
        `
        DELETE FROM instructor_schedules

        WHERE instructor_schedule_id=?

        AND instructor_id=?

        `,
        [
            scheduleId,
            instructorId
        ]
    );

}