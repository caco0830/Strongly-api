const SetsService = {
    getAllSets(knex){
        return knex.select('*').from('strongly_sets');
    }

}

module.exports = SetsService;