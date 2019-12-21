const SetsService = {
    getAllSets(knex){
        return knex.select('*').from('strongly_sets');
    },
    getById(knex, id){
        return knex.from('strongly_sets').select('*').where('id', id).first();
    },
    getWithQueries(knex, queries){
        return knex
            .from('strongly_sets')
            .select('*')
            .where(queries);
    },
    getByWorkoutId(knex, workoutId){
        return knex
            .from('strongly_sets')
            .select('*')
            .where('workout_id', parseInt(workoutId));
    },
    insertSet(knex, newSet){
        return knex
            .insert(newSet)
            .into('strongly_sets')
            .returning('*')
            .then(rows => { 
                return rows[0];
            });
    },
    deleteSet(knex, id){
        return knex('strongly_sets')
            .where({id})
            .delete();
    },
    updateSet(knex, id, newSetFields){
        return knex('strongly_sets')
            .where({id})
            .update(newSetFields);
    },
    updateMultiSets(knex, newSets){
        newSets.map(set => 
            knex('strongly_sets')
            .where('id', set.id)
            .update(set)
        );
    }
}

module.exports = SetsService;