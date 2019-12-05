const WorkoutsService = {
    getAllWorkouts(knex){
        return knex.select('*').from('strongly_workouts');
    },
    insertWorkouts(knex, newWorkout){
        return knex
            .insert(newWorkout)
            .into('strongly_workouts')
            .returning('*')
            . then(rows => {
                return rows[0];
            });
    }

}
 
module.exports = WorkoutsService;