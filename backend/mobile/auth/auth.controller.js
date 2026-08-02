import bcrypt from "bcrypt";
import pool from '../../db.js'


export async function login(req,res){

    try {

        const { email, password } = req.body;


        if(!email || !password){
            return res.status(400).json({
                error:"Email and password are required"
            });
        }

        const [rows] = await pool.query(
            `
            SELECT 
                sa.auth_id,
                sa.email,
                sa.password,
                s.staff_id,
                s.f_name,
                s.m_name,
                s.l_name,
                s.profile,
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

        if(rows.length === 0){
            return res.status(401).json({
                error:"Account not found"
            });
        }


        const user = rows[0];


        const validPassword = await bcrypt.compare(
            password,
            user.password
        );


        if(!validPassword){

            return res.status(401).json({
                error:"Invalid password"
            });

        }


        // Only instructor allowed
        if(user.role_name !== "Instructor"){

            return res.status(403).json({
                error:"Mobile access is only for instructors"
            });

        }


        return res.json({

            message:"Login successful",

            user:{
                id:user.staff_id,
                email:user.email,
                firstName:user.f_name,
                middleName:user.m_name,
                lastName:user.l_name,
                role:user.role_name,
                profile:user.profile
            }

        });


    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Server error"
        });

    }

}

export default login