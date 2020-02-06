CREATE TABLE projects_skills_assignments (
  project_id INT NOT NULL,
  skill_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
  CONSTRAINT unk_project_id_skill_id UNIQUE (project_id, skill_id)
);