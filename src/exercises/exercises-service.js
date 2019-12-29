const ExercisesService = {
    getAllExercises(knex){
        return knex.select('*').from('strongly_exercises');
    },
    getUserExercises(knex, user_id){
        return knex.select('*').from('strongly_exercises').where({user_id});
    },
    getExercisesByWorkoutId(knex, workoutId){
        return knex.select('*').from('strongly_exercises').where('workout_id', workoutId);
    },
    getById(knex, id){
        return knex
            .from('strongly_exercises')
            .select('*')
            .where('id', id)
            .first();
    },
    insertExercises(knex, newExercise){
        return knex
            .insert(newExercise)
            .into('strongly_exercises')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    deleteExercise(knex, id){
        return knex('strongly_exercises')
            .where({id})
            .delete();
    },
    updateExercise(knex, id, newExerciseFields){
        return knex('strongly_exercises')
            .where({id})
            .update(newExerciseFields);
    },
    updateMultiExercises(knex, newExercises){
        return newExercises.map(ex => {
            const {id, workout_id, title} = ex;
            const newEx = {title, workout_id};

            return knex('strongly_exercises')
            .where('id', ex.id)
            .update(newEx)
            .returning('*')
        });
    }
}

module.exports = ExercisesService;