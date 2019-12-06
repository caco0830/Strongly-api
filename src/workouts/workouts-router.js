const express = require('express');
const xss = require('xss');
const WorkoutsService = require('./workouts-service');

const workoutsRouter = express.Router();
const jsonParser = express.json();

const serializeWorkout = workout => ({
    id: workout.id,
    title: xss(workout.title),
    createddate: workout.createddate
});

workoutsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        WorkoutsService.getAllWorkouts(knexInstance)
            .then(workouts => {
                res.json(workouts.map(serializeWorkout))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const {title} = req.body;
        const newWorkout = {title};

        for(const [key, value] of Object.entries(newWorkout)){
            if(value == null){
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                });
            }
        }

        WorkoutsService.insertWorkouts(
            req.app.get('db'),
            newWorkout
        )
        .then(workout => {
            res
                .status(201)
                .json(serializeWorkout(workout));
        })
        .catch(next);
    });

    workoutsRouter
        .route('/:workout_id')
        .all((req, res, next) => {
            WorkoutsService.getById(
                req.app.get('db'),
                req.params.workout_id
            )
            .then(workout => {
                if(!workout){
                    return res.status(404).json({
                        error: {message: `Workout doesn't exist`}
                    });
                }
                res.workout = workout;
                next();
            })
            .catch(next);
        })
        .get((req, res, next) => {
            res.json(serializeWorkout(res.workout));
        })
        .delete((req, res, next) => {
            WorkoutsService.deleteWorkout(
                req.app.get('db'),
                req.params.workout_id
            )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
        });

module.exports = workoutsRouter;