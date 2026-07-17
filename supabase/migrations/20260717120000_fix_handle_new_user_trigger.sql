-- Update the handle_new_user trigger function to also populate first_name and
-- last_name from user metadata when signup collects them. This allows the
-- profile to be pre-populated immediately after email verification, rather
-- than waiting for the onboarding wizard's provisioning step.
--
-- The ON CONFLICT DO NOTHING keeps this idempotent for existing users.
-- All new columns are nullable — no existing rows are affected.

CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL)
  )
  ON CONFLICT (id) DO UPDATE
    SET
      first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
      last_name  = COALESCE(EXCLUDED.last_name,  profiles.last_name),
      full_name  = CASE
                     WHEN profiles.full_name IS NULL OR profiles.full_name = ''
                     THEN EXCLUDED.full_name
                     ELSE profiles.full_name
                   END;

  -- Auto-create default portfolio (existing behavior — preserved)
  INSERT INTO public.portfolios (user_id, total_value, risk_profile)
  VALUES (NEW.id, 0, 'balanced')
  ON CONFLICT (user_id) DO NOTHING;

  -- Auto-create free subscription (existing behavior — preserved)
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Tighten the execute grant: anon users have no reason to call this function
-- directly. It is invoked only as a trigger (by the postgres role internally).
REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon";
REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "authenticated";
-- service_role may still invoke it if ever needed via the admin API
GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";
