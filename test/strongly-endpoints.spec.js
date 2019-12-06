const knex = require('knex');
const app = require('../app');
const {makeWorkouts} = require('./strongly.fixtures');

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

    describe('POST /api/workouts', () => {
        it('created workout, responding with 201 and new workout', () => {
            const newWorkout = {
                title: 'Test Workout'
            }

            return supertest(app)
                .post('/api/workouts')
                .send(newWorkout)
                .expect(201)
                .expect(res => {
                    console.log(res.body);
                    expect(res.body.title).to.eql(newWorkout.title);
                    expect(res.body).to.have.property('id');
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

    describe('DELETE /api/workouts/workout_id', () => {
        context('Given no workouts', () => {
            it('responds with 404', () => {
                const workoutId = 123;
                return supertest(app)
                    .delete(`/api/workouts/${workoutId}`)
                    .expect(404, {error: {message: `Workout doesn't exist`}});
            });
        });

        context.only('Given there are workouts', () => {
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