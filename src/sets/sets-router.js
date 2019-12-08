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
        const knexInstance = req.app.get('db');
        SetsService.getAllSets(knexInstance)
            .then(sets => {
                res.json(sets.map(serializeSets))
            })
            .catch(next);
    })


module.exports = setsRouter;

