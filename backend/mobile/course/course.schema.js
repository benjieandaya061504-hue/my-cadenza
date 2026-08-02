export const courseModuleSchema = {
    course_module: {
        required: true,
        type: "string",
        maxLength: 255
    }
};

export const createCourseSchema = {
    course: {
        required: true,
        type: "string",
        maxLength: 255
    },

    course_module_id: {
        required: true,
        type: "number"
    }
};

export const updateCourseSchema = {
    course: {
        required: true,
        type: "string",
        maxLength: 255
    },

    course_module_id: {
        required: true,
        type: "number"
    }
};