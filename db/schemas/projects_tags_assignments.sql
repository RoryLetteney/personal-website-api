CREATE TABLE projects_tags_assignments (
  project_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
  CONSTRAINT unk_project_id_tag_id UNIQUE (project_id, tag_id)
);