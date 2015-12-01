# iot-webserver

## Setting up postgres triggers

Create ROOM_CLIMATE table:
```
CREATE TABLE room_climate (
    id integer NOT NULL,
    "time" timestamp without time zone DEFAULT now(),
    temperature numeric(4,2),
    humidity numeric(4,2),
    source integer
);
```

Create the update function:
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

Create a trigger with the function:
```
DROP TRIGGER users_notify_insert ON users;
CREATE TRIGGER users_notify_insert AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE table_update_notify();
```
