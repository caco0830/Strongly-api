const ExercisesService = {
    getAllExercises(knex){
        return knex.select('*').from('strongly_exercises');
    },
    getExercisesByWorkoutId(knex, workoutId){
        //console.log(workoutId)
        return knex.select('*').from('strongly_exercises').where('workout_id', parseInt(workoutId));
    }
}

module.exports = ExercisesService;