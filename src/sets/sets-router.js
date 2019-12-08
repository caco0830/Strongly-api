const express = require('express');
const xss = require('xss');
const SetsService = require('./sets-service');

const setsRouter = express.Router();
const jsonParser = express.json();

const serializeSets = set => ({
    id: set.id,
    set_number: set.set_number,
    reps: set.reps,
    exercise_id: set.exercise_id,
    weight: set.weight,
    workout_id: set.workout_id
});

setsRouter
    .route('/')
    .get((req, res, next) => {
        const queries = ['exercise_id', 'workout_id'];
        const knexInstance = req.app.get('db');
        const match = [];

        for(const propName in req.query){
            if(!queries.includes(propName)){
                return res.status(404).json({
                    error: {message: `${propName} is not a valid query`}
                });
            }
        }

        if(req.query.workout_id){
            match.workout_id = req.query.workout_id;
        }

        if(req.query.exercise_id){
            match.exercise_id = req.query.exercise_id;
        }
        
        SetsService.getWithQueries(knexInstance, match)
            .then(sets => {
                res.json(sets.map(serializeSets))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const {title, set, rep, exercise_id, weight, workout_id} = req.body;
        const newSet = {title, set, rep, exercise_id, weight, workout_id};

        for(const [key, value] of Object.entries(newSet)){
            if(value === null){
                return res.status(404).json({
                    error: {message: `Missing '${key}' in request body`}
                });
            }
        }

        SetsService.insertSet(
            req.app.get('db'),
            newSet
        )
        .then(set => {
            res
                .status(201)
                .json(serializeSets(set));
        })
        .catch(next);
    })

setsRouter
    .route('/:set_id')
    .all((req, res, next) => {
        ExerciseService.getById(
            req.app.get('db'),
            req.params.set_id
        )
        .then(set => {
            if(!set){
                return res.status(404).json({
                    error: {message: `Set doesn't exist`}
                });
            }
            res.set = set;
            next();
        })
        .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeSets(res.set));
    })
    .delete((req, res, next) => {
        SetsService.deleteSet(
            req.app.get('db'),
            req.params.set_id
        )
        .then(() => {
            res.status(204).end();
        })
        .catch(next);
    });


module.exports = setsRouter;

