ALTER TABLE
  tags
ALTER COLUMN
  name
SET
  NOT NULL;

ALTER TABLE
  tags
ADD
  CONSTRAINT unk_tags_name UNIQUE (name);