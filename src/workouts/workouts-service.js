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
    },
    getById(knex, id){
        return knex
            .from('strongly_workouts')
            .select('*')
            .where('id', id)
            .first();
    },
    deleteWorkout(knex, id){
        return knex('strongly_workouts')
            .where({id})
            .delete();
    }

}
 
module.exports = WorkoutsService;