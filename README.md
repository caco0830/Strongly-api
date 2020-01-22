# Strongly REST API

API used to create, post and delete workouts for the application. Database consists of 3 tables (workouts, exercises and sets). Each table has a POST, GET, PATCH, and DELETE method. 

# Workouts
## GET a single workout or a list of workouts

### Method:
GET /api/workouts/:workout_id

### URL Params

##### Optional:
    workout_id = [UUID]

### Success Response:
* **Code:** 200 <br />
  **Content:** `[{"db_id":8, "id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2", "title":"Morning Workout", "createddate":"2020-01-02T22:11:32.195Z", "user_id":1}]`

  OR including workout_id
  
* **Code:** 200 <br />
  **Content:** `{"db_id":8,"id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","title":"Morning Workout","createddate":"2020-01-02T22:11:32.195Z","user_id":1}`

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/workouts/workout_id`, {
        method: 'GET',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

## POST Workouts

### Method:
POST /api/workouts/

### Body:
    {
        "id":"efb56ba0-24d1-4ec4-883b-796782111f41",
        "title":"Test Workout",
        "createddate":"2020-01-21T05:38:56.256Z",
        "user_id":1
    }


### Success Response:
* **Code:** 201 <br />
  **Content:** `{"db_id":17, "id":"efb56ba0-24d1-4ec4-883b-796782111f41", "title":"Test Workout", "createddate":"2020-01-21T05:39:03.201Z", "user_id":1}`


### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/workouts`, {
        method: 'POST',
        headers:{
            'content-type': 'application/json',
            'authorization': `bearer [token]`
        },
        body: JSON.stringify(workout),
    })
```

## PATCH a Workout

### Method:
PATCH /api/workouts/:workout_id

### URL Params

##### Required:
    workout_id = [UUID]

### Body:
    {
        "id":"efb56ba0-24d1-4ec4-883b-796782111f41",
        "title":"Test Workout",
        "createddate":"2020-01-21T05:38:56.256Z",
        "user_id":1
    }

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/workouts/:workout_id`, {
        method: 'PATCH',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

## DELETE a Workout

### Method:
DELETE /api/workouts/:workout_id

### URL Params

##### Required:
    workout_id = [UUID]

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/workouts/:workout_id`, {
        method: 'DELETE',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

# Exercises
## GET a list of exercises

### Method:
GET /api/exercises/:workout_id

### URL Params

##### Optional:
    workout_id = [UUID] - Including a workout id will only GET the exercises for that workout

### Success Response:
* **Code:** 200 <br />
  **Content:** `[{"db_id":7,"id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6","workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","title":"Bench","user_id":1},
  {"db_id":8,"id":"a71ef08a-8c36-4824-a32a-24af02e1f92d","workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","title":"Deadlift","user_id":1},
  {"db_id":6,"id":"00cfb558-617c-43f0-8221-00361a8c418e","workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","title":"Squat","user_id":1}]`

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/exercises/workout_id`, {
        method: 'GET',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

## POST Exercises

### Method:
POST /api/exercises/

### Body:
    [{
        "id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6",
        "workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2",
        "title":"Bench",
        "user_id":1
    }]

### Success Response:
* **Code:** 201 <br />
  **Content:** `[{"db_id":7,"id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6","workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","title":"Bench","user_id":1}]`

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/exercises`, {
        method: 'POST',
        headers:{
            'content-type': 'application/json',
            'authorization': `bearer [token]`
        },
        body: JSON.stringify(workout),
    })
```

## PATCH a Exercises

### Method:
PATCH /api/exercises/:exercise_id

### URL Params

##### Required:
    exercise_id = [UUID]

### Body:
    [{
        "id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6",
        "workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2",
        "title":"Bench",
        "user_id":1
    }]

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/exercises/:exercise_id`, {
        method: 'PATCH',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

## DELETE an Exercise

### Method:
DELETE /api/exercise/:exercise_id

### URL Params

##### Required:
    exercise_id = [UUID]

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/exercises/:exercise_id`, {
        method: 'DELETE',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

# Sets
## GET a list of sets

### Method:
GET /api/sets/

### URL Queries

##### Optional:
    workout_id = [UUID] - which workout the sets belong to

### Success Response:
* **Code:** 200 <br />
  **Content:** `[{"db_id":20,"id":"b6513e91-20f4-423e-af81-6f5e81686aaa","reps":5,"exercise_id":"a71ef08a-8c36-4824-a32a-24af02e1f92d","weight":95,"workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","user_id":1}]`

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/sets?workout_id=[workout_id]`, {
        method: 'GET',
        headers: {
            'authorization': `bearer ${TokenService.getAuthToken()}`
        }
    })
```

## POST Sets

### Method:
POST /api/sets/

### Body:
    [{
        "exercise_id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6",
        "id":"e791161e-bc70-44ca-8d3d-0bddd66bf1bf",
        "reps":"1",
        "weight":"1",
        "workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2"
    }]

### Success Response:
* **Code:** 201 <br />
  **Content:** `{"db_id":38,"id":"e791161e-bc70-44ca-8d3d-0bddd66bf1bf","reps":1,"exercise_id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6","weight":1,"workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2","user_id":1}`

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/sets`, {
        method: 'POST',
        headers:{
            'content-type': 'application/json',
            'authorization': `bearer [token]`
        },
        body: JSON.stringify(workout),
    })
```

## PATCH a Set

### Method:
PATCH /api/sets/:set_id

### URL Params

##### Required:
    set_id = [UUID]

### Body:
    [{
        "exercise_id":"c41c1b2c-b4de-474d-9f48-2e20d0d421b6",
        "id":"e791161e-bc70-44ca-8d3d-0bddd66bf1bf",
        "reps":"1",
        "weight":"1",
        "workout_id":"8db27ff5-b5ae-461b-9d67-70077e68d9c2"
    }]

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/sets/:set_id`, {
        method: 'PATCH',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```

## DELETE an Exercise

### Method:
DELETE /api/sets/:set_id

### URL Params

##### Required:
    set_id = [UUID]

### Success Response:
* **Code:** 204 <br />

### Sample Call:
```javascript
    fetch(`${config.API_ENDPOINT}/api/sets/:set_id`, {
        method: 'DELETE',
        headers:{
            'authorization': `bearer [token]`
        }
    })
```