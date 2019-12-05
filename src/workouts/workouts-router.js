const express = require('express');
const xss = require('xss');
const WorkoutsService = require('./workouts-service');

const workoutsRouter = express.Router();
const jsonParser = express.json();

workoutsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        WorkoutsService.getAllWorkouts(knexInstance)
            .then(workouts => {
                res.json(workouts)
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        
    })

module.exports = workoutsRouter;