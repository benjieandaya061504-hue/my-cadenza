export const loginSchema = {
    email: {
        required: true,
        type: "email"
    },

    password: {
        required: true,
        minLength: 8
    }
};


export const updateProfileSchema = {
    first_name:{
        required:true
    },

    last_name:{
        required:true
    }
};