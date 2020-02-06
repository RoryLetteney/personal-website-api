CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT null,
  description TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  deleted SMALLINT NOT NULL DEFAULT 0
);