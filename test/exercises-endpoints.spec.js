const knex = require('knex');
const app = require('../app');
const {makeWorkouts, makeExercises, makeWorkoutFixtures} = require('./strongly.fixtures');
const helpers = require('./test-helpers');

describe('Strongly Endpoints', function(){
    let db;

    const {testUsers, testWorkouts, testExercises, testSets} = makeWorkoutFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE strongly_users, strongly_workouts, strongly_exercises, strongly_sets RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE strongly_users, strongly_workouts, strongly_exercises, strongly_sets RESTART IDENTITY CASCADE'));
    
    describe('GET /api/exercises', () => {
        context('Given no exercises', () => {
            
            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            );

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/exercises')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context('Given there are exercises', () => {

            beforeEach('insert exercises', () => {
                helpers.seedWorkoutTables(
                    db,
                    testUsers,
                    testWorkouts,
                    testExercises,
                    testSets,
                );
            });

            it('responds with 200 and all of the exercises', () => {
                return supertest(app)
                    .get('/api/exercises')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, testExercises);
            });
        });
    });

    //get exercises by workout id
    describe('GET /api/exercises?workout_id=workout_id', () => {
        const workoutId = "ce1f061c-1ca7-4f82-81c8-476f08eaa511";
        context('Given no exercises', () => {

            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            );
            
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/exercises?workout_id=${workoutId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context('Given there are exercises for workout in query', () => {
            const expectedExercises = testExercises.filter(ex => {return ex.workout_id === workoutId});

            beforeEach('insert workouts', () => 
                helpers.seedWorkoutTables(
                    db,
                    testUsers,
                    testWorkouts,
                    testExercises,
                    testSets,
                )
            );

            it('responds with 200 and all of the exercises', () => {
                return supertest(app)
                    .get(`/api/exercises?workout_id=${workoutId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedExercises);
            });
        });

        context('Given an invalid query', () => {

            beforeEach('insert workouts', () => 
                helpers.seedWorkoutTables(
                    db,
                    testUsers,
                    testWorkouts,
                    testExercises,
                    testSets,
                )
            );

            it('responds with 404', () => {
                return supertest(app)
                    .get(`/api/exercises?invalid=123`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `invalid is not a valid query`}});
            });
        });
    });

    //POST exercises
    describe('POST /api/exercises', () => {
        const testWorkouts = makeWorkouts();

        beforeEach('insert workouts', () => 
            helpers.seedWorkoutTables(
                db,
                testUsers,
                testWorkouts,
                testExercises,
                testSets,
            )
        );

        it('creates an exercise, responds with 201 and the new exercise', () => {
            const newExercise = {
                id: 'd3b68775-1a24-40a1-a8ef-5dc946f773fc',
                workout_id : 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d',
                title: 'New'
            }

            return supertest(app)
                .post('/api/exercises')
                .send(newExercise)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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

            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            );

            it('responds with 404', () => {
                const exerciseId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                return supertest(app)
                    .patch(`/api/exercises/${exerciseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Exercise doesn't exist`}});
            });
        });

        context('Given there are exercises in the database', () => {

            beforeEach('insert workouts', () => 
                helpers.seedWorkoutTables(
                    db,
                    testUsers,
                    testWorkouts,
                    testExercises,
                    testSets,
                )
            );

            it('responds with 204 and the updated exercise', () => {
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa511';
                const updateExercise = {
                    title: 'updated title',
                    workout_id: 'a24682c1-0f97-4866-ae24-ba09ea4e2b81'
                }
                
                const testExercise = testExercises.filter(ex => {
                    return ex.id === idToUpdate;
                })

                const expectedExercises = {
                    ...testExercise[0],
                    ...updateExercise
                }

                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .send(updateExercise)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/exercises/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedExercises)
                        );
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa511';
                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain an id, title and workout_id'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa511';
                const updateExercise = {
                    title: 'updated title'
                }

                const testExercise = testExercises.filter(ex => {
                    return ex.id === idToUpdate;
                })

                const expectedExercises = {
                    ...testExercise[0],
                    ...updateExercise
                }

                return supertest(app)
                    .patch(`/api/exercises/${idToUpdate}`)
                    .send({
                        ...updateExercise,
                        fieldToIgnore: 'should not be in response'
                    })
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/exercises/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedExercises)
                        );
            });
        });
    });

    //delete exercises
    describe('DELETE /api/exercises/exercise_id', () => {
        context('Given no exercises', () => {

            beforeEach(() =>
                helpers.seedUsers(db, testUsers)
            );

            it('responds with 404', () => {
                const exerciseId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa511';
                return supertest(app)
                    .delete(`/api/exercises/${exerciseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: {message: `Exercise doesn't exist`}});
            });
        });

        context('Given there are exercises', () => {
            const testWorkouts = makeWorkouts();
            const testExercises = makeExercises();

            beforeEach('insert workouts', () => 
                helpers.seedWorkoutTables(
                    db,
                    testUsers,
                    testWorkouts,
                    testExercises,
                    testSets,
                )
            );

             it('responds with 204 and deletes the exercise', () => {
                 const exerciseId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa511';
                 const expectedExercises = testExercises.filter(exercise => exercise.id !== exerciseId);

                 return supertest(app)
                    .delete(`/api/exercises/${exerciseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/exercises')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedExercises)
                    );
             });
        });
    });
});