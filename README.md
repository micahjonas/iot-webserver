# IOT Webserver

## Requirements

Runs on Node.JS 4.2.1 and PostgreSQL 9.4

## Setup
```
npm install
npm start
```
Open the broser at: [localhost:3000](http://localhost:3000)
## Setting up postgres triggers

Import the DB Dump or use it as sample db setup

### Create the update and trigger for ROOM_CLIMATE function:
```
CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
DECLARE
  id bigint;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    id = NEW.id;
  ELSE
    id = OLD.id;
  END IF;
  PERFORM pg_notify('table_update', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

```
DROP TRIGGER users_notify_insert ON users;
CREATE TRIGGER users_notify_insert AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE table_update_notify();
```

### Create the update and trigger for ROOM_SOUND function:
```
CREATE OR REPLACE FUNCTION table_sound_update_notify() RETURNS trigger AS $$
DECLARE
  id bigint;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    id = NEW.id;
  ELSE
    id = OLD.id;
  END IF;
  PERFORM pg_notify('table_sound_update', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

```
CREATE TRIGGER sound_notify_insert AFTER INSERT ON ROOM_SOUND FOR EACH ROW EXECUTE PROCEDURE table_sound_update_notify();
```
