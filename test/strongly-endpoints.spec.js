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

    //TODO: get sets by exercise id
    //TODO: get get sets by workout id

  
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

    //TODO: POST sets
    

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

    //TODO: delete exercises

    describe.only('DELETE /api/exercises/exercise_id', () => {
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

    
    //TODO: delete sets
});