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
                });
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
    .post(jsonParser, (req, res, next) => {
        //console.log(req.body);
        //const [{id, workout_id, title}] = req.body;
        //const newExercises = [{workout_id, title}];
        const newExercises = req.body;
        //console.log(newExercises);

        // for(const [key, value] of Object.entries(newExercises)){
        //     if(value == null){
        //         return res.status(400).json({
        //             error: {message: `Missing '${key}' in request body`}
        //         });
        //     }
        // }

        ExercisesService.insertExercises(
            req.app.get('db'),
            newExercises
        )
        .then(exercise => {
            res
                .status(201)
                .json(serializeExercises(exercise));
        })
        .catch(next);
    });

exercisesRouter
    .route('/:exercise_id')
    .all((req, res, next) => {
        ExercisesService.getById(
            req.app.get('db'),
            req.params.exercise_id
        )
        .then(exercise => {
            if(!exercise){
                return res.status(404).json({
                    error: {message: `Exercise doesn't exist`}
                });
            }
            res.exercise = exercise;
            next();
        })
        .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeExercises(res.exercise));
    })
    .delete((req, res, next) => {
        ExercisesService.deleteExercise(
            req.app.get('db'),
            req.params.exercise_id
        )
        .then(() => {
            res.status(204).end();
        })
        .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const {title, workout_id} = req.body;
        const exerciseToUpdate = {title, workout_id};

        const numberOfValues = Object.values(exerciseToUpdate).filter(Boolean).length;

        if(numberOfValues === 0){
            return res.status(400).json({
                error: {message: 'Request body must contain a title and workout_id'}
            });
        }

        ExercisesService.updateExercise(
            req.app.get('db'),
            req.params.exercise_id,
            exerciseToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end();
        })
        .catch(next);
    });

module.exports = exercisesRouter;