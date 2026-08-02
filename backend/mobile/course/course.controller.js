import * as service from "./course.service.js";


// =====================
// COURSE MODULES
// =====================

export async function getCourseModules(req,res){

    res.json(
        await service.getCourseModules()
    );

}


export async function getCourseModuleById(req,res){

    res.json(
        await service.getCourseModuleById(
            req.params.id
        )
    );

}


export async function createCourseModule(req,res){

    res.status(201).json(
        await service.createCourseModule(
            req.body
        )
    );

}


export async function updateCourseModule(req,res){

    res.json(
        await service.updateCourseModule(
            req.params.id,
            req.body
        )
    );

}


export async function deleteCourseModule(req,res){

    await service.deleteCourseModule(
        req.params.id
    );

    res.json({
        message:"Deleted"
    });

}



// =====================
// COURSES
// =====================

export async function getCourses(req,res){

    res.json(
        await service.getCourses()
    );

}


export async function getCourseById(req,res){

    res.json(
        await service.getCourseById(
            req.params.id
        )
    );

}


export async function createCourse(req,res){

    res.status(201).json(
        await service.createCourse(
            req.body
        )
    );

}


export async function updateCourse(req,res){

    res.json(
        await service.updateCourse(
            req.params.id,
            req.body
        )
    );

}


export async function deleteCourse(req,res){

    await service.deleteCourse(
        req.params.id
    );

    res.json({
        message:"Deleted"
    });

}