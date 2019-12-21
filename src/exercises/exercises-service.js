const ExercisesService = {
    getAllExercises(knex){
        return knex.select('*').from('strongly_exercises');
    },
    getExercisesByWorkoutId(knex, workoutId){
        //console.log(workoutId)
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
        //console.log('updating')
        return newExercises.map(ex => {
            //console.log(ex)
            const {id, workout_id, title} = ex;
            const newEx = {title, workout_id};
            //console.log(newEx)

            return knex('strongly_exercises')
            .where('id', ex.id)
            .update(newEx)
            .returning('*')
        });
    }
    
}

module.exports = ExercisesService;