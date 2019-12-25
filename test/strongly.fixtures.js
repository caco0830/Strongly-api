function makeWorkouts() {
    return [
        {
            "db_id": 1,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa51d",
            "title": "Morning Workout",
            "createddate": "2019-11-06T05:55:06.943Z",
        },
        {
            "db_id": 2,
            "id": "4d1ef4ba-91e1-430b-b049-438c70646a30",
            "title": "Afternoon Workout",
            "createddate": "2019-11-06T05:55:06.943Z",
        },
        {
            "db_id": 3,
            "id": "a24682c1-0f97-4866-ae24-ba09ea4e2b81",
            "title": "Late Night Workout",
            "createddate": "2019-11-06T05:55:06.943Z",
        }
    ];
}

function makeExercises() {
    return [
        {   
            "db_id": 1,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa511",
            "workout_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa51d",
            "title": "Squat",
        },
        {
            "db_id": 2,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa512",
            "workout_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa51d",
            "title": "Bench",
        },
        {
            "db_id": 3,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa513",
            "workout_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa51d",
            "title": "Rows",
        },
        {
            "db_id": 4,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa514",
            "workout_id": "4d1ef4ba-91e1-430b-b049-438c70646a30",
            "title": "Squat",
        },
        {
            "db_id": 5,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa515",
            "workout_id": "4d1ef4ba-91e1-430b-b049-438c70646a30",
            "title": "Overhead Press",
        },
        {
            "db_id": 6,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa516",
            "workout_id": "4d1ef4ba-91e1-430b-b049-438c70646a30",
            "title": "Deadlift",
        },
        {
            "db_id": 7,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa517",
            "workout_id": "a24682c1-0f97-4866-ae24-ba09ea4e2b81",
            "title": "Squat",
        },
        {
            "db_id": 8,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa518",
            "workout_id": "a24682c1-0f97-4866-ae24-ba09ea4e2b81",
            "title": "Bench",
        },
        {
            "db_id": 9,
            "id": "ce1f061c-1ca7-4f82-81c8-476f08eaa519",
            "workout_id": "a24682c1-0f97-4866-ae24-ba09ea4e2b81",
            "title": "Rows",
        },
    ];
}

function makeSets() {
    return [
        {
            "db_id": 1,
            "id": "ede2a3da-4da8-4801-9fe4-f4d4de0daab4",
            "reps": 5,
            "exercise_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa511",
            "weight": 135,
            "workout_id": 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d'
        },
        {
            "db_id": 2,
            "id":"bec25c08-1e91-4fa9-a6c7-9ed3c44bf385",
            "reps": 3,
            "exercise_id": "ce1f061c-1ca7-4f82-81c8-476f08eaa511",
            "weight": 135,
            "workout_id": 'ce1f061c-1ca7-4f82-81c8-476f08eaa51d'
        },
    ];
}

module.exports = {
    makeWorkouts,
    makeExercises,
    makeSets
}