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
                const SetId = 'bec25c08-1e91-4fa9-a6c7-9ed3c44bf385';
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
                const setId = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
                const expectedSet = testSets[0];
                return supertest(app)
                    .get(`/api/sets/${setId}`)
                    .expect(200, expectedSet);
            });
        });
    });

    //get sets by exercise id
    describe('GET /api/sets?exercise_id=exercise_id', () => {
        const exerciseId = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
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
        const workoutId = 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d';
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
                "id": 'c9fc8f5d-c524-4700-875f-cc7d33f42788',
                "reps": 5,
                "exercise_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa511",
                "weight": 135,
                "workout_id": 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d'
            }

            return supertest(app)
                .post('/api/sets')
                .send(newSet)
                .expect(201)
                .expect(res => {
                    expect(res.body.reps).to.eql(newSet.reps);
                    expect(res.body.exercise_id).to.eql(newSet.exercise_id);
                    expect(res.body.workout_id).to.eql(newSet.workout_id);
                    expect(res.body.weight).to.eql(newSet.weight);
                    expect(res.body).to.have.property('id');
                });
        });
    });

    //update sets
    describe('PATCH /api/sets/:set_id', () => {
        context('Given no sets', () => {
            it('responds with 404', () => {
                const setId = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
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
                const idToUpdate = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
                const testSet = testSets.filter(s => {
                    return s.id === idToUpdate;
                });
                const updateSet = {
                    reps: 4,
                    weight: 140
                }

                const expectedSets = {
                    ...testSet[0],
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
                const idToUpdate = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
                return supertest(app)
                    .patch(`/api/sets/${idToUpdate}`)
                    .send({noField: 'none'})
                    .expect(400, {
                        error: {message: 'Request body must contain reps, weight, set_number, exercise_id, workout_id'}
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
                const testSet = testSets.filter(s => {
                    return s.id === idToUpdate;
                });
                const updateSet = {
                    reps: 4
                }

                const expectedSets = {
                    ...testSet[0],
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
    
    //delete sets
    describe('DELETE /api/sets/set_id', () => {
        context('Given no sets', () => {
            it('responds with 404', () => {
                const setId = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
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
                const setId = 'ede2a3da-4da8-4801-9fe4-f4d4de0daab4';
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