const knex = require('knex');
const app = require('../app');
const helpers = require('./test-helpers');

describe('Protected Endpoints', function(){
    let db;

    const {testUsers, testWorkouts, testExercises, testSets} = helpers.makeWorkoutFixtures();

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
    
    describe('Protected Endpoints', () => {
        beforeEach('insert workouts', () => 
            helpers.seedWorkoutTables(
                db,
                testUsers,
                testWorkouts,
                testExercises,
                testSets,
            )
        );

        describe('GET /api/workouts/:workout_id', () => {
            it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .expect(401, {error: `Missing bearer token`})
            });

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const validUser = testUsers[0];
                const invalidSecret = 'bad-secret';
                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {error: `Unauthorized request`});
            });

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = {username: 'user-does-not-exist', id: 1};
                return supertest(app)
                    .get('/api/workouts/ce1f061c-1ca7-4f82-81c8-476f08eaa51d')
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {error: 'Unauthorized request'});
            });
        });
    });
});