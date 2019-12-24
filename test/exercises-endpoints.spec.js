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
});