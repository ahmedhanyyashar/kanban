-- Roles and priorities are closed sets. The API validates them; the database refuses anything else too,
-- whoever writes (a script, a console, a later service).
ALTER TABLE "board_member" ADD CONSTRAINT "board_member_role_check" CHECK ("role" IN ('owner', 'admin', 'member'));
ALTER TABLE "task" ADD CONSTRAINT "task_priority_check" CHECK ("priority" IN ('low', 'medium', 'high', 'urgent'));
