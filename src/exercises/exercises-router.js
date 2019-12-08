const express =  require('express');
const xss = require('xss');
const ExercisesService = require('./exercises-service');

const exercisesRouter = express.Router();
const jsonParser = express.json();

const serializeExercises = exercise => ({
    id: exercise.id,
    workout_id: exercise.workout_id,
    title: xss(exercise.title)
});

exercisesRouter
    .route('/')
    .get((req, res, next) => {
        const queries = ['workout_id'];
        const knexInstance = req.app.get('db');

        for(const propName in req.query){
            if(!queries.includes(propName)){
                return res.status(404).json({
                    error: {message: `${propName} is not a valid query`}
                })
            } 
        }

        if(Object.keys(req.query).length === 0){

            ExercisesService.getAllExercises(knexInstance)
                .then(exercises => {
                    res.json(exercises.map(serializeExercises))
                })
                .catch(next);

        }else if(Object.keys(req.query).includes('workout_id')){
            ExercisesService.getExercisesByWorkoutId(knexInstance, req.query.workout_id)
                .then(exercises => {
                    res.json(exercises.map(serializeExercises))
                })
                .catch(next);
            
        }
        
    })

module.exports = exercisesRouter;