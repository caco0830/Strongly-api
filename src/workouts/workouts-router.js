const express = require('express');
const xss = require('xss');
const WorkoutsService = require('./workouts-service');
//const { requireAuth } = require('../middleware/basic-auth');
const {requireAuth} = require('../middleware/jwt-auth');

const workoutsRouter = express.Router();
const jsonParser = express.json();

const serializeWorkout = workout => ({
    db_id: workout.db_id,
    id: workout.id,
    title: xss(workout.title),
    createddate: workout.createddate
});

workoutsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        WorkoutsService.getAllWorkouts(knexInstance)
            .then(workouts => {
                res.json(workouts.map(serializeWorkout))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { id, title } = req.body;
        const newWorkout = { id, title };

        for (const [key, value] of Object.entries(newWorkout)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }
        newWorkout.user_id = req.user.id;

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
    .all(requireAuth)
    .all((req, res, next) => {
        WorkoutsService.getById(
            req.app.get('db'),
            req.params.workout_id
        )
            .then(workout => {
                if (!workout) {
                    return res.status(404).json({
                        error: { message: `Workout doesn't exist` }
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
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        console.log('patching')
        const { title } = req.body;
        const workoutToUpdate = { title };

        const numberOfValues = Object.values(workoutToUpdate).filter(Boolean).length;

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain a title` }
            })
        }

        WorkoutsService.updateWorkout(
            req.app.get('db'),
            req.params.workout_id,
            workoutToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = workoutsRouter;