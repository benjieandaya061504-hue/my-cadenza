import bcrypt from "bcrypt";
import pool from "../../db.js";


export async function loginMobile(data){

    const {
        email,
        password
    } = data;

    if(!email || !password){
        throw {
            status:400,
            message:"Email and password are required"
        };
    }

    // Check users table (students)
    const [users] = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
    );

    if(users.length > 0){

        const user = users[0];


        if(user.role !== "student"){
            throw {
                status:403,
                message:"Use instructor account for staff login"
            };
        }

        const valid =
        await bcrypt.compare(
            password,
            user.password
        );

        if(!valid){
            throw {
                status:401,
                message:"Invalid password"
            };
        }

        return {
            id:user.id,
            email:user.email,
            role:user.role
        };

    }

    // Check instructor/staff login
    const [staff] = await pool.query(
        `
        SELECT
            sa.email,
            sa.password,
            s.staff_id,
            s.f_name,
            s.l_name,
            r.role_name
        FROM Staff_Auth sa
        JOIN Staff s
            ON sa.staff_id = s.staff_id
        JOIN Role r
            ON s.role_id = r.role_id
        WHERE sa.email = ?
        `,
        [email]
    );

    if(staff.length === 0){

        throw {
            status:401,
            message:"Account not found"
        };

    }

    const instructor = staff[0];

    const valid =
    await bcrypt.compare(
        password,
        instructor.password
    );

    if(!valid){

        throw {
            status:401,
            message:"Invalid password"
        };
    }

    return {

        id: instructor.staff_id,

        email: instructor.email,

        role:"instructor",

        name:
        `${instructor.f_name} ${instructor.l_name}`

    };

}