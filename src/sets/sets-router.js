const express = require('express');
const xss = require('xss');
const SetsService = require('./sets-service');
const {requireAuth} = require('../middleware/jwt-auth');

const setsRouter = express.Router();
const jsonParser = express.json();

const serializeSets = set => ({
    db_id:set.db_id,
    id: set.id,
    reps: set.reps,
    exercise_id: set.exercise_id,
    weight: set.weight,
    workout_id: set.workout_id,
    user_id: set.user_id
});

setsRouter
    .route('/')
    .all(requireAuth)
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

        match.user_id = req.user.id;
        
        SetsService.getWithQueries(knexInstance, match)
            .then(sets => {
                res.json(sets.map(serializeSets))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const newSet = req.body;

        if(!newSet[0]){
            newSet.user_id = req.user.id;
        }else{
            newSet.forEach(s => {
                s.user_id = req.user.id;
            });
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
    .patch(jsonParser,(req, res, next) => {
        const newSet = req.body;

        SetsService.updateMultiSets(
            req.app.get('db'),
            req.body
        )
        .then(numRowsAffected => {
            res.status(204).end();
        })
        .catch(next); 
    });

setsRouter
    .route('/:set_id')
    .all(requireAuth)
    .all((req, res, next) => {  
        SetsService.getById(
            req.app.get('db'),
            req.params.set_id
        )
        .then(sets => {
            if(!sets){
                return res.status(404).json({
                    error: {message: `Set doesn't exist`}
                });
            }
            res.sets = sets;
            next();
        })
        .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeSets(res.sets));
    })
    .delete(requireAuth, (req, res, next) => {
        SetsService.deleteSet(
            req.app.get('db'),
            req.params.set_id
        )
        .then(() => {
            res.status(204).end();
        })
        .catch(next);
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const {reps, weight} = req.body;
        const setToUpdate = {reps, weight};

        const numberOfValues = Object.values(setToUpdate).filter(Boolean).length;

        if(numberOfValues === 0){
            return res.status(400).json({
                error: {message: 'Request body must contain reps, weight, set_number, exercise_id, workout_id'}
            });
        }
        
        SetsService.updateSet(
            req.app.get('db'),
            req.params.set_id,
            setToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end();
        })
        .catch(next);
    });


module.exports = setsRouter;

