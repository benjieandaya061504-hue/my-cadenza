import * as service from "./instructor.routes.js";


// INSTRUCTORS
export async function getAll(req,res){

    try{

        const data = await service.getAll();

        res.json(data);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function getById(req,res){

    try{

        const data = await service.getById(
            req.params.id
        );

        res.json(data);

    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function create(req,res){

    try{

        const data = await service.create(
            req.body
        );


        res.status(201).json(data);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function update(req,res){

    try{

        const data = await service.update(
            req.params.id,
            req.body
        );


        res.json(data);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function remove(req,res){

    try{

        await service.remove(
            req.params.id
        );


        res.json({
            message:"Instructor deleted"
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

// SCHEDULES

export async function getSchedules(req,res){

    try{

        const data = await service.getSchedules(
            req.params.id
        );

        res.json(data);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function createSchedule(req,res){

    try{

        const data = await service.createSchedule(
            req.params.id,
            req.body
        );

        res.status(201).json(data);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function updateSchedule(req,res){

    try{

        const data = await service.updateSchedule(
            req.params.scheduleId,
            req.params.id,
            req.body
        );


        res.json(data);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}

export async function removeSchedule(req,res){

    try{

        await service.removeSchedule(
            req.params.scheduleId,
            req.params.id
        );


        res.json({
            message:"Schedule deleted"
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

}