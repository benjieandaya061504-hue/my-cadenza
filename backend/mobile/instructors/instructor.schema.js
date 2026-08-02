export const instructorSchema = {

    course_id:{
        required:true,
        type:"number"
    },


    staff_id:{
        required:true,
        type:"number"
    }

};

export const instructorScheduleSchema = {

    enrollment_id:{
        required:true,
        type:"number"
    },
    sess_room_id:{
        required:true,
        type:"number"
    },
    session_start_time:{
        required:true,
        type:"date"
    },
    session_end_time:{
        required:true,
        type:"date"
    },
    is_active:{
        required:false,
        type:"boolean"
    }
};