const express =  require('express');
const xss = require('xss');
const ExercisesService = require('./exercises-service');
const {requireAuth} = require('../middleware/jwt-auth');

const exercisesRouter = express.Router();
const jsonParser = express.json();

const serializeExercises = exercise => ({
    db_id: exercise.db_id,
    id: exercise.id,
    workout_id: exercise.workout_id,
    title: xss(exercise.title),
    user_id: exercise.user_id
});

exercisesRouter
    .route('/')
    .all(requireAuth)
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
            ExercisesService.getUserExercises(knexInstance, req.user.id)
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        
        const newExercises = req.body;

        if(!newExercises[0]){
            newExercises.user_id = req.user.id;
        }else{
            newExercises.forEach(ex => {
                ex.user_id = req.user.id;
            });
        }

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
    })
    .patch(requireAuth, jsonParser,(req, res, next) => {
        const newSet = req.body;
        
        ExercisesService.updateMultiExercises(
            req.app.get('db'),
            newSet
        )
    });

exercisesRouter
    .route('/:exercise_id')
    .all(requireAuth)
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
    .delete(requireAuth, (req, res, next) => {
        ExercisesService.deleteExercise(
            req.app.get('db'),
            req.params.exercise_id
        )
        .then(() => {
            res.status(204).end();
        })
        .catch(next);
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const {id, title, workout_id} = req.body;
        const exerciseToUpdate = {id, title, workout_id};

        const numberOfValues = Object.values(exerciseToUpdate).filter(Boolean).length;

        if(numberOfValues === 0){
            return res.status(400).json({
                error: {message: 'Request body must contain an id, title and workout_id'}
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