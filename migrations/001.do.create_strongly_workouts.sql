CREATE TABLE strongly_workouts(
    db_id INTEGER GENERATED BY DEFAULT AS IDENTITY,
    id UUID PRIMARY KEY NOT NULL,
    title TEXT,
    createdDate TIMESTAMP DEFAULT now() NOT NULL
);