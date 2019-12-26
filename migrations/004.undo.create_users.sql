ALTER TABLE strongly_workouts
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE strongly_exercises
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE strongly_sets
    DROP COLUMN IF EXISTS user_id;