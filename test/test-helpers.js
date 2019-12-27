const bcrypt = require('bcryptjs');

function seedUsers(db, users){
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));

    return db.into('strongly_users').insert(preppedUsers)
        .then(() => 
            db.raw(
                `SELECT setval('strongly_users_id_seq',?)`,
                [users[users.length - 1].id],
            )    
        );
}

function seedWorkoutTables(db, users, workouts, exercises, sets){
    
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('strongly_workouts').insert(workouts);

        await trx.raw(
            `SELECT setval('strongly_workouts_db_id_seq', ?)`,
            [workouts[workouts.length - 1].db_id],
        );
        
        if(exercises.length){
            await trx.into('strongly_exercises').insert(exercises);
            await trx.raw(
                `SELECT setval('strongly_exercises_db_id_seq', ?)`,
                [exercises[exercises.length - 1].db_id]
            );
        }

        if(sets.length){
            await trx.into('strongly_sets').insert(sets);
            await trx.raw(
                `SELECT setval('strongly_exercises_db_id_seq', ?)`,
                [sets[sets.length - 1].db_id]
            );
        }
    });
}

function makeAuthHeader(user){
    const token = Buffer.from(`${user.username}:${user.password}`).toString('base64');
    return `Basic ${token}`;
}

module.exports = {
    seedUsers,
    seedWorkoutTables,
    makeAuthHeader,
}