CREATE TABLE skills_tags_assignments (
  skill_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
  CONSTRAINT unk_skill_id_tag_id UNIQUE (skill_id, tag_id)
);