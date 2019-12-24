const knex = require('knex');
const app = require('../app');
const {makeWorkouts, makeExercises, makeSets} = require('./strongly.fixtures');

describe('Workouts Endpoints', function(){
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
});