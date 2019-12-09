const knex = require('knex');
const app = require('../app');
const {makeWorkouts, makeExercises, makeSets} = require('./strongly.fixtures');

describe('Strongly Endpoints', function(){
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE strongly_workouts, strongly_exercises, strongly_sets RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE strongly_workouts, strongly_exercises, strongly_sets RESTART IDENTITY CASCADE'));
   
    describe('GET /api/workouts', () => {
        context('Given no workouts', () => {
            it('reponds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/workouts')
                    .expect(200, []);
            });
        });

        context('Given there are workouts', () => {
             const testWorkouts =  makeWorkouts();
             
             beforeEach('insert workouts', () => {
                 return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
             });

             it('responds with 200 and all of the workouts', () => {
                 return supertest(app)
                    .get('/api/workouts')
                    .expect(200, testWorkouts);
             });
        });
    });

    describe('GET /api/workouts/workout_id', () => {
        context('Given no workouts', () => {
            it('responds with 404', () => {
                const workoutId = 234;
                return supertest(app)
                    .get(`/api/workouts/${workoutId}`)
                    .expect(404, {error: {message: `Workout doesn't exist`}});
            });
        });

        context('Given there are workouts', () => {
            const testWorkouts = makeWorkouts();

            beforeEach('insert workouts', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts);
            });

            it('responds with 200 and the specified workout', () => {
                const workoutId = 2;
                const expectedWorkout = testWorkouts[workoutId-1];
                return supertest(app)
                    .get(`/api/workouts/${workoutId}`)
                    .expect(200, expectedWorkout);
            });


        });
    });

    describe('GET /api/exercises', () => {
        context('Given no exercises', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/exercises')
                    .expect(200, []);
            });
        });

        context('Given there are exercises', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();

            beforeEach('insert exercises', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises);
                    });
            });

            it('responds with 200 and all of the exercises', () => {
                return supertest(app)
                    .get('/api/exercises')
                    .expect(200, testExercises);
            });
        });
    });

    //get exercises by workout id
    describe('GET /api/exercises?workout_id=workout_id', () => {
        const workoutId = 1;
        context('Given no exercises', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/exercises?workout_id=${workoutId}`)
                    .expect(200, []);
            });
        });

        context('Given there are exercises for workout in query', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const expectedExercises = testExercises.filter(ex => {return ex.workout_id === workoutId});

            beforeEach('insert exercises', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises);
                    });
            });

            it('responds with 200 and all of the exercises', () => {
                return supertest(app)
                    .get(`/api/exercises?workout_id=${workoutId}`)
                    .expect(200, expectedExercises);
            });
        });

        context('Given an invalid query', () => {

            it('responds with 404', () => {
                return supertest(app)
                    .get(`/api/exercises?invalid=123`)
                    .expect(404, {error: {message: `invalid is not a valid query`}});
            });
        });
    });

    describe('GET /api/sets', () => {
        context('Given no sets', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/sets')
                    .expect(200, []);
            });
        });

        context('Given there are sets in the database', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                               return db
                                    .into('strongly_sets') 
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 200 and a list of sets', () => {
                return supertest(app)
                    .get('/api/sets')
                    .expect(200, testSets);
            });
        });
    });

    describe('GET /api/sets/sets_id', () => {
        context('Given no sets', () => {
            it('responds with 404', () => {
                const SetId = 234;
                return supertest(app)
                    .get(`/api/sets/${SetId}`)
                    .expect(404, {error: {message: `Set doesn't exist`}});
            });
        });

        context('Given there are sets', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                               return db
                                    .into('strongly_sets') 
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 200 and the specified set', () => {
                const setId = 2;
                const expectedSet = testSets[setId-1];
                return supertest(app)
                    .get(`/api/sets/${setId}`)
                    .expect(200, expectedSet);
            });
        });
    });

    //get sets by exercise id
    describe('GET /api/sets?exercise_id=exercise_id', () => {
        const exerciseId = 1;
        context('Given no sets', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/sets?exercise_id=${exerciseId}`)
                    .expect(200, []);
            });
        });

        context('Given there are sets for exercise in query', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();
            const expectedSets = testSets.filter(s => {return s.exercise_id === exerciseId});

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                                return db 
                                    .into('strongly_sets')
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 200 and a list of sets', () => {
                return supertest(app)
                    .get(`/api/sets?exercise_id=${exerciseId}`)
                    .expect(expectedSets);
            });
        });

        context('Given an invalid query', () => {
            it('responds with 404', () => {
                return supertest(app)
                    .get('/api/sets?invalid=no')
                    .expect(404, {error: {message: 'invalid is not a valid query'}});
            });
        });
    });

    //get get sets by workout id
    describe('GET /api/sets?workout_id=workout_id', () => {
        const workoutId = 1;
        context('Given no sets', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/sets?workout_id=${workoutId}`)
                    .expect(200, []);
            });
        });

        context('Given there are sets for workout in query', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();
            const expectedSets = testSets.filter(s => {return s.workout_id === workoutId});

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                                return db 
                                    .into('strongly_sets')
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 200 and a list of sets', () => {
                return supertest(app)
                    .get(`/api/sets?workout_id=${workoutId}`)
                    .expect(expectedSets);
            });
        });

        context('Given an invalid query', () => {
            it('responds with 404', () => {
                return supertest(app)
                    .get('/api/sets?invalid=no')
                    .expect(404, {error: {message: 'invalid is not a valid query'}});
            });
        });
    });
  
    describe('POST /api/workouts', () => {
        it('creates workout, responding with 201 and new workout', () => {
            const newWorkout = {
                title: 'Test Workout'
            }

            return supertest(app)
                .post('/api/workouts')
                .send(newWorkout)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newWorkout.title);
                    expect(res.body).to.have.property('id');
                });
        });
    });

    //POST exercises
    describe('POST /api/exercises', () => {
        const testWorkouts = makeWorkouts();

        beforeEach('insert data', () => {
            return db
                .into('strongly_workouts')
                .insert(testWorkouts);
        });

        it('creates an exercise, responds with 201 and the new exercise', () => {
            const newExercise = {
                workout_id : 1,
                title: 'New'
            }

            return supertest(app)
                .post('/api/exercises')
                .send(newExercise)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newExercise.title);
                    expect(res.body).to.have.property('id');
                });
        });
    });

    //POST sets
    describe('POST /api/sets', () => {
        const testWorkouts = makeWorkouts();
        const testExercises = makeExercises();

        beforeEach('insert data', () => {
            return db
                .into('strongly_workouts')
                .insert(testWorkouts)
                .then(() => {
                    return db
                        .into('strongly_exercises')
                        .insert(testExercises);
                });
        });

        it('it creates set, responding with 201 and new set', () => {
            const newSet = {
                "set_number": 1,
                "reps": 5,
                "exercise_id": 1,
                "weight": 135,
                "workout_id": 1
            }

            return supertest(app)
                .post('/api/sets')
                .send(newSet)
                .expect(201)
                .expect(res => {
                    expect(res.body.reps).to.eql(newSet.reps);
                    expect(res.body.set_number).to.eql(newSet.set_number);
                    expect(res.body.exercise_id).to.eql(newSet.exercise_id);
                    expect(res.body.workout_id).to.eql(newSet.workout_id);
                    expect(res.body.weight).to.eql(newSet.weight);
                    expect(res.body).to.have.property('id');
                });
        });
    });
    
    //update workouts
    describe('PATCH /api/workouts/:workout_id', () => {
        context('Given no workouts', () => {
            it('responds with 404', () => {
                const workoutId = 1;
                return supertest(app)
                    .patch(`/api/workouts/${workoutId}`)
                    .expect(404, {error: {message: `Workout doesn't exist`}});
            });
        });

        context('Given there are workouts in the database', () => {
            const testWorkouts = makeWorkouts();

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts);
            });

            it('responds with 204 and the updated workout', () => {
                const idToUpdate = 2;
                const updateWorkout = {
                    title: 'updated title'
                }

                const expectedWorkouts = {
                    ...testWorkouts[idToUpdate - 1],
                    ...updateWorkout
                }

                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .send(updateWorkout)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/workouts/${idToUpdate}`)
                        .expect(expectedWorkouts)
                        );
            });

            it('responds with 400 when no requiered fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain a title'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2;
                const updateWorkout = {
                    title: 'updated title'
                }

                const expectedWorkouts = {
                    ...testWorkouts[idToUpdate - 1],
                    ...updateWorkout
                }

                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .send({
                        ...updateWorkout,
                        fieldToIgnore: 'should not be in response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/workouts/${idToUpdate}`)
                        .expect(expectedWorkouts)
                        );
            });
        });
    });

    //update exercises
    describe('PATCH /api/exercises/:exercise_id', () => {
        context('Given no exercises', () => {
            it('responds with 404', () => {
                const exerciseId = 1;
                return supertest(app)
                    .patch(`/api/exercises/${exerciseId}`)
                    .expect(404, {error: {message: `Exercise doesn't exist`}});
            });
        });

        context('Given there are exercises in the database', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();

             beforeEach('insert data', () => {
                 return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises);
                    });
             });

            it('responds with 204 and the updated exercise', () => {
                const idToUpdate = 2;
                const updateExercise = {
                    title: 'updated title',
                    workout_id: 1
                }

                const expectedExercises = {
                    ...testExercises[idToUpdate - 1],
                    ...updateExercise
                }

                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .send(updateExercise)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/exercises/${idToUpdate}`)
                        .expect(expectedExercises)
                        );
            });

            it('responds with 400 when no requiered fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain a title and workout_id'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2;
                const updateExercise = {
                    title: 'updated title'
                }

                const expectedExercises = {
                    ...testExercises[idToUpdate - 1],
                    ...updateExercise
                }

                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .send({
                        ...updateExercise,
                        fieldToIgnore: 'should not be in response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/exercises/${idToUpdate}`)
                        .expect(expectedExercises)
                        );
            });
        });
    });

    //update sets
    describe('PATCH /api/sets/:set_id', () => {
        context('Given no sets', () => {
            it('responds with 404', () => {
                const setId = 1;
                return supertest(app)
                    .patch(`/api/sets/${setId}`)
                    .expect(404, {error: {message: `Set doesn't exist`}});
            });
        });

        context('Given there are sets in the database', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                               return db
                                    .into('strongly_sets') 
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 204 and the updated set', () => {
                const idToUpdate = 1;
                const updateSet = {
                    reps: 4,
                    weight: 140
                }

                const expectedSets = {
                    ...testSets[idToUpdate - 1],
                    ...updateSet
                }

                return supertest(app)
                    .patch(`/api/sets/${idToUpdate}`)
                    .send(updateSet)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/sets/${idToUpdate}`)
                        .expect(expectedSets)
                        );
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/sets/${idToUpdate}`)
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain reps, weight, set_number, exercise_id, workout_id'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2;
                const updateSet = {
                    reps: 4
                }

                const expectedSets = {
                    ...testSets[idToUpdate - 1],
                    ...updateSet
                }

                return supertest(app)
                    .patch(`/api/sets/${idToUpdate}`)
                    .send({
                        ...updateSet,
                        fieldToIgnore: 'should not be in response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/sets/${idToUpdate}`)
                        .expect(expectedSets)
                        );
            });
        });
    });

    describe('DELETE /api/workouts/workout_id', () => {
        context('Given no workouts', () => {
            it('responds with 404', () => {
                const workoutId = 123;
                return supertest(app)
                    .delete(`/api/workouts/${workoutId}`)
                    .expect(404, {error: {message: `Workout doesn't exist`}});
            });
        });

        context('Given there are workouts', () => {
            const testWorkouts = makeWorkouts();

            beforeEach('insert workouts', () => {
                return db 
                    .into('strongly_workouts')
                    .insert(testWorkouts);
            });

            it('responds with 204 and deletes the workout', () => {
                const workoutId = 2;
                const expectedWorkouts = testWorkouts.filter(workout => workout.id !== workoutId);

                return supertest(app)
                    .delete(`/api/workouts/${workoutId}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/workouts')
                        .expect(expectedWorkouts)
                        );
            });

        });
    });

    //delete exercises
    describe('DELETE /api/exercises/exercise_id', () => {
        context('Given no exercises', () => {
            it('responds with 404', () => {
                const exerciseId = 1;
                return supertest(app)
                    .delete(`/api/exercises/${exerciseId}`)
                    .expect(404, {error: {message: `Exercise doesn't exist`}});
            });
        });

        context('Given there are exercises', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();

             beforeEach('insert data', () => {
                 return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises);
                    });
             });

             it('responds with 204 and deletes the exercise', () => {
                 const exerciseId = 1;
                 const expectedExercises = testExercises.filter(exercise => exercise.id !== exerciseId);

                 return supertest(app)
                    .delete(`/api/exercises/${exerciseId}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/exercises')
                        .expect(expectedExercises)
                    );
             });
        });
    });

    //delete sets
    describe('DELETE /api/sets/set_id', () => {
        context('Given no sets', () => {
            it('responds with 404', () => {
                const setId = 1;
                return supertest(app)
                    .delete(`/api/sets/${setId}`)
                    .expect(404, {error: {message: `Set doesn't exist`}});
            });
        });

        context('Given there are sets', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();
            const testSets = makeSets();

            beforeEach('insert data', () => {
                return db
                    .into('strongly_workouts')
                    .insert(testWorkouts)
                    .then(() => {
                        return db
                            .into('strongly_exercises')
                            .insert(testExercises)
                            .then(() => {
                               return db
                                    .into('strongly_sets') 
                                    .insert(testSets);
                            });
                    });
            });

            it('responds with 204 and deletes the set', () => {
                const setId = 1;
                const expectedSets = testSets.filter(s => s.id !== setId);

                return supertest(app)
                    .delete(`/api/sets/${setId}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/sets')
                        .expect(expectedSets)
                        );
            });
        });
    });
});