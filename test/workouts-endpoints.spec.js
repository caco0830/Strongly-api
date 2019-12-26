const knex = require('knex');
const app = require('../app');
const {makeWorkouts, makeUsers, makeWorkoutFixtures} = require('./strongly.fixtures');

describe.only('Workouts Endpoints', function(){
    let db;

    const {testUsers, testWorkouts, testExercises, testSets} = makeWorkoutFixtures();

    function makeAuthHeader(user){
        const token = Buffer.from(`${user.username}:${user.password}`).toString('base64');
        return `Basic ${token}`;
    }

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
    
    describe('Protected Endpoints', () => {
        const testWorkouts =  makeWorkouts();
        beforeEach('insert workouts', () => {
            return db
               .into('strongly_workouts')
               .insert(testWorkouts)
        });

        describe('GET /api/workouts/:workout_id', () => {
            it(`responds with 401 'Missing basic token' when no basic token`, () => {
                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .expect(401, {error: `Missing basic token`})
            });

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = {username: '', password: ''}
                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, {error: `Unauthorized request`});
            });

            it(`responds 401 'Unauthorized request' when invalid user`, () => {
                const userInvalidCreds = {username: 'user-bad', password: 'cool'}

                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .set('Authorization', makeAuthHeader(userInvalidCreds))
                    .expect(401, {error: 'Unauthorized request'});
            });

            it(`responds 401 'Unauthorized request' when invalid password`, () => {
                const userInvalidPass = {username: testUsers[0].username, password: 'cool'}

                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .set('Authorization', makeAuthHeader(userInvalidPass))
                    .expect(401, {error: 'Unauthorized request'});
            });
        });
    });

    describe('GET /api/workouts', () => {
        context('Given no workouts', () => {
            it('reponds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/workouts')
                    .set('Authorization', makeAuthHeader(testUsers[0]))
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
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, testWorkouts);
             });
        });
    });

    describe('GET /api/workouts/workout_id', () => {
        context('Given no workouts', () => {
            // beforeEach(() => 
            //     db.into('strongly_users').insert(testUsers)
            // );

            it('responds with 404', () => {
                const workoutId = '66b59caa-f492-4719-b98c-ac6569fd217c';
                return supertest(app)
                    .get(`/api/workouts/${workoutId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
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
                const workoutId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                const expectedWorkout = testWorkouts.filter(workout => {
                    return workout.id === workoutId;
                });
                return supertest(app)
                    .get(`/api/workouts/${workoutId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, expectedWorkout[0]);
            });
        });
    });

    describe('POST /api/workouts', () => {
        it('creates workout, responding with 201 and new workout', () => {
            const newWorkout = {
                id: 'bcaad68c-b859-4757-b649-ca87aad08e49',
                title: 'Test Workout'
            }

            return supertest(app)
                .post('/api/workouts')
                .send(newWorkout)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newWorkout.title);
                    expect(res.body).to.have.property('id');
                });
        });
    });

    //update workouts
    describe('PATCH /api/workouts/:workout_id', () => {
        context('Given no workouts', () => {

            it('responds with 404', () => {
                const workoutId = 'bcaad68c-b859-4757-b649-ca87aad08e49';
                return supertest(app)
                    .patch(`/api/workouts/${workoutId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
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
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                const updateWorkout = {
                    title: 'updated title'
                }
                const testWorkout = testWorkouts.filter(workout => {
                    return workout.id === idToUpdate;
                });

                const expectedWorkouts = {
                    ...testWorkout[0],
                    ...updateWorkout
                }
                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send(updateWorkout)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/workouts/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(expectedWorkouts)
                        );
            });

            it('responds with 400 when no requiered fields supplied', () => {
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain a title'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                const updateWorkout = {
                    title: 'updated title'
                }
                const testWorkout = testWorkouts.filter(workout => {
                    return workout.id === idToUpdate;
                });

                const expectedWorkouts = {
                    ...testWorkout[0],
                    ...updateWorkout
                }

                return supertest(app)
                    .patch(`/api/workouts/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send({
                        ...updateWorkout,
                        fieldToIgnore: 'should not be in response'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/workouts/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(expectedWorkouts)
                        );
            });
        });
    });

    describe('DELETE /api/workouts/workout_id', () => {
        context('Given no workouts', () => {
            it('responds with 404', () => {
                const workoutId = 'bcaad68c-b859-4757-b649-ca87aad08e49';
                return supertest(app)
                    .delete(`/api/workouts/${workoutId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
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
                const workoutId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
                const expectedWorkouts = testWorkouts.filter(workout => workout.id !== workoutId);

                return supertest(app)
                    .delete(`/api/workouts/${workoutId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get('/api/workouts')
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(expectedWorkouts)
                        );
            });
        });
    });
});