CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  example TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT unk_skills_name UNIQUE (name)
);