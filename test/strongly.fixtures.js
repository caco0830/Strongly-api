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
            "id": 1,
            "workout_id": 1,
            "title": "Squat",
        },
        {
            "id": 2,
            "workout_id": 1,
            "title": "Bench",
        },
        {
            "id": 3,
            "workout_id": 1,
            "title": "Rows",
        },
        {
            "id": 4,
            "workout_id": 2,
            "title": "Squat",
        },
        {
            "id": 5,
            "workout_id": 2,
            "title": "Overhead Press",
        },
        {
            "id": 6,
            "workout_id": 2,
            "title": "Deadlift",
        },
        {
            "id": 7,
            "workout_id": 3,
            "title": "Squat",
        },
        {
            "id": 8,
            "workout_id": 3,
            "title": "Bench",
        },
        {
            "id": 9,
            "workout_id": 3,
            "title": "Rows",
        },
    ];
}

function makeSets() {
    return [
        {
            "id": 1,
            "set_number": 1,
            "reps": 5,
            "exercise_id": 1,
            "weight": 135,
            "workout_id": 1
        },
        {
            "id": 2,
            "set_number": 2,
            "reps": 3,
            "exercise_id": 1,
            "weight": 135,
            "workout_id": 1
        },
        // {
        //     "id": 3,
        //     "set_number": 3,
        //     "reps": 2,
        //     "exercise_id": 1,
        //     "weight": 135,
        //     "workout_id": 1
        // },
        // {
        //     "id": 4,
        //     "set_number": 4,
        //     "reps": 10,
        //     "exercise_id": 1,
        //     "weight": 135,
        //     "workout_id": 1
        // },
        // {
        //     "id": 5,
        //     "set_number": 5,
        //     "reps": 10,
        //     "exercise_id": 1,
        //     "weight": 135,
        //     "workout_id": 1
        // },
        // {
        //     "id": 6,
        //     "set_number": 5,
        //     "reps": 10,
        //     "exercise_id": 5,
        //     "weight": 135,
        //     "workout_id": 2
        // },
    ];
}

module.exports = {
    makeWorkouts,
    makeExercises,
    makeSets
}