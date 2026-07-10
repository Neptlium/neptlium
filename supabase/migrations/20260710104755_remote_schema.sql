


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."impact_level_type" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."impact_level_type" OWNER TO "postgres";


CREATE TYPE "public"."protocol_status" AS ENUM (
    'active',
    'paused',
    'deprecated'
);


ALTER TYPE "public"."protocol_status" OWNER TO "postgres";


CREATE TYPE "public"."protocol_type" AS ENUM (
    'defi',
    'cefi',
    'staking',
    'lending',
    'liquidity',
    'yield_farming'
);


ALTER TYPE "public"."protocol_type" OWNER TO "postgres";


CREATE TYPE "public"."rebalance_trigger" AS ENUM (
    'manual',
    'scheduled',
    'drift',
    'risk_threshold'
);


ALTER TYPE "public"."rebalance_trigger" OWNER TO "postgres";


CREATE TYPE "public"."risk_profile_type" AS ENUM (
    'conservative',
    'balanced',
    'growth'
);


ALTER TYPE "public"."risk_profile_type" OWNER TO "postgres";


CREATE TYPE "public"."risk_tier" AS ENUM (
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
);


ALTER TYPE "public"."risk_tier" OWNER TO "postgres";


CREATE TYPE "public"."strategy_type" AS ENUM (
    'conservative',
    'balanced',
    'growth',
    'aggressive',
    'custom'
);


ALTER TYPE "public"."strategy_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_plan" AS ENUM (
    'free',
    'pro',
    'elite'
);


ALTER TYPE "public"."subscription_plan" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'canceled',
    'past_due',
    'trialing',
    'incomplete'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE TYPE "public"."transaction_status" AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE "public"."transaction_status" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'deposit',
    'withdraw'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE TYPE "public"."whale_direction" AS ENUM (
    'inflow',
    'outflow',
    'transfer'
);


ALTER TYPE "public"."whale_direction" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_add_deposit_address"("p_asset" "text", "p_network" "text", "p_address" "text", "p_provider" "text" DEFAULT 'address_pool'::"text", "p_provider_reference" "text" DEFAULT NULL::"text", "p_label" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                      declare
                                        new_id uuid;
                                        begin
                                          insert into deposit_addresses (
                                              asset,
                                                  network,
                                                      address,
                                                          provider,
                                                              provider_reference,
                                                                  label,
                                                                      status
                                                                        )
                                                                          values (
                                                                              upper(p_asset),
                                                                                  lower(p_network),
                                                                                      trim(p_address),
                                                                                          p_provider,
                                                                                              p_provider_reference,
                                                                                                  p_label,
                                                                                                      'available'
                                                                                                        )
                                                                                                          on conflict (network, address)
                                                                                                            do update set
                                                                                                                asset = excluded.asset,
                                                                                                                    provider = excluded.provider,
                                                                                                                        provider_reference = excluded.provider_reference,
                                                                                                                            label = excluded.label
                                                                                                                              returning id into new_id;

                                                                                                                                return new_id;
                                                                                                                                end;
                                                                                                                                $$;


ALTER FUNCTION "public"."admin_add_deposit_address"("p_asset" "text", "p_network" "text", "p_address" "text", "p_provider" "text", "p_provider_reference" "text", "p_label" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_crypto_deposit"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_tx_hash" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
                                                                                                                                                                                  begin
                                                                                                                                                                                    insert into crypto_deposit_events (user_id, asset, network, amount, tx_hash)
                                                                                                                                                                                      values (p_user_id, p_asset, p_network, p_amount, p_tx_hash)
                                                                                                                                                                                        on conflict do nothing;

                                                                                                                                                                                          perform credit_balance(
                                                                                                                                                                                              p_user_id,
                                                                                                                                                                                                  p_asset,
                                                                                                                                                                                                      p_network,
                                                                                                                                                                                                          p_amount,
                                                                                                                                                                                                              'crypto',
                                                                                                                                                                                                                  gen_random_uuid()
                                                                                                                                                                                                                    );
                                                                                                                                                                                                                    end;
                                                                                                                                                                                                                    $$;


ALTER FUNCTION "public"."confirm_crypto_deposit"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_tx_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_payment_intent"("p_payment_intent_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
                                                                                                                                declare
                                                                                                                                  intent record;
                                                                                                                                  begin
                                                                                                                                    select * into intent from payment_intents where id = p_payment_intent_id;

                                                                                                                                      if intent.status = 'completed' then return; end if;

                                                                                                                                        update payment_intents
                                                                                                                                          set status = 'completed', completed_at = now()
                                                                                                                                            where id = p_payment_intent_id;

                                                                                                                                              perform credit_balance(
                                                                                                                                                  intent.user_id,
                                                                                                                                                      intent.asset,
                                                                                                                                                          intent.network,
                                                                                                                                                              intent.amount,
                                                                                                                                                                  'stripe',
                                                                                                                                                                      intent.id
                                                                                                                                                                        );
                                                                                                                                                                        end;
                                                                                                                                                                        $$;


ALTER FUNCTION "public"."confirm_payment_intent"("p_payment_intent_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_withdrawal_request"("p_asset" "text", "p_network" "text", "p_amount" numeric, "p_address" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
                                                                                                                                                                                                                            declare
                                                                                                                                                                                                                              uid uuid := auth.uid();
                                                                                                                                                                                                                                wid uuid;
                                                                                                                                                                                                                                begin
                                                                                                                                                                                                                                  update account_balances
                                                                                                                                                                                                                                    set available = available - p_amount,
                                                                                                                                                                                                                                          reserved = reserved + p_amount
                                                                                                                                                                                                                                            where user_id = uid
                                                                                                                                                                                                                                              and available >= p_amount;

                                                                                                                                                                                                                                                insert into withdrawal_requests (user_id, asset, network, amount, destination_address)
                                                                                                                                                                                                                                                  values (uid, p_asset, p_network, p_amount, p_address)
                                                                                                                                                                                                                                                    returning id into wid;

                                                                                                                                                                                                                                                      return wid;
                                                                                                                                                                                                                                                      end;
                                                                                                                                                                                                                                                      $$;


ALTER FUNCTION "public"."create_withdrawal_request"("p_asset" "text", "p_network" "text", "p_amount" numeric, "p_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."credit_balance"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_source" "text", "p_reference_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
                                                                                                                  begin
                                                                                                                    insert into account_balances (user_id, asset, network, available)
                                                                                                                      values (p_user_id, upper(p_asset), lower(p_network), p_amount)
                                                                                                                        on conflict (user_id, asset, network)
                                                                                                                          do update set available = account_balances.available + excluded.available;

                                                                                                                            insert into ledger_entries (user_id, asset, network, amount, direction, source, reference_id)
                                                                                                                              values (p_user_id, p_asset, p_network, p_amount, 'credit', p_source, p_reference_id);
                                                                                                                              end;
                                                                                                                              $$;


ALTER FUNCTION "public"."credit_balance"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_source" "text", "p_reference_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_portfolio"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                                                                                                                                                BEGIN
                                                                                                                                                                                                                                                  INSERT INTO public.strategies (portfolio_id, name, strategy_type)
                                                                                                                                                                                                                                                    VALUES (NEW.id, 'Default Strategy', NEW.risk_profile::text::strategy_type)
                                                                                                                                                                                                                                                      ON CONFLICT (portfolio_id) DO NOTHING;

                                                                                                                                                                                                                                                        RETURN NEW;
                                                                                                                                                                                                                                                        END;
                                                                                                                                                                                                                                                        $$;


ALTER FUNCTION "public"."handle_new_portfolio"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
                                                                                                                              BEGIN
                                                                                                                                INSERT INTO public.profiles (id, email, full_name)
                                                                                                                                  VALUES (
                                                                                                                                      NEW.id,
                                                                                                                                          NEW.email,
                                                                                                                                              COALESCE(NEW.raw_user_meta_data->>'full_name', '')
                                                                                                                                                )
                                                                                                                                                  ON CONFLICT (id) DO NOTHING;

                                                                                                                                                    -- Auto-create default portfolio
                                                                                                                                                      INSERT INTO public.portfolios (user_id, total_value, risk_profile)
                                                                                                                                                        VALUES (NEW.id, 0, 'balanced')
                                                                                                                                                          ON CONFLICT (user_id) DO NOTHING;

                                                                                                                                                            -- Auto-create free subscription
                                                                                                                                                              INSERT INTO public.subscriptions (user_id, plan, status)
                                                                                                                                                                VALUES (NEW.id, 'free', 'active')
                                                                                                                                                                  ON CONFLICT (user_id) DO NOTHING;

                                                                                                                                                                    RETURN NEW;
                                                                                                                                                                    END;
                                                                                                                                                                    $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
            select exists (
                select 1 from user_roles
                    where user_id = p_user_id and role = 'admin'
                      );
                      $$;


ALTER FUNCTION "public"."is_admin"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_rebalancing_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
                                                                                                                                                                                                                BEGIN
                                                                                                                                                                                                                  RAISE EXCEPTION 'rebalancing_events are immutable. No updates allowed.';
                                                                                                                                                                                                                  END;
                                                                                                                                                                                                                  $$;


ALTER FUNCTION "public"."prevent_rebalancing_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
                                                                                                                  BEGIN
                                                                                                                    NEW.updated_at = NOW();
                                                                                                                      RETURN NEW;
                                                                                                                      END;
                                                                                                                      $$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_strategy_allocation_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
                                                                                                                                        DECLARE
                                                                                                                                          total NUMERIC;
                                                                                                                                          BEGIN
                                                                                                                                            SELECT COALESCE(SUM(target_pct), 0)
                                                                                                                                              INTO total
                                                                                                                                                FROM public.strategy_allocations
                                                                                                                                                  WHERE strategy_id = NEW.strategy_id
                                                                                                                                                      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

                                                                                                                                                        IF total + NEW.target_pct > 100 THEN
                                                                                                                                                            RAISE EXCEPTION 'Total strategy allocation cannot exceed 100%%. Current: %, Adding: %', total, NEW.target_pct;
                                                                                                                                                              END IF;

                                                                                                                                                                RETURN NEW;
                                                                                                                                                                END;
                                                                                                                                                                $$;


ALTER FUNCTION "public"."validate_strategy_allocation_total"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account_balances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "asset" "text" DEFAULT 'USDC'::"text" NOT NULL,
    "network" "text" DEFAULT 'base'::"text" NOT NULL,
    "available" numeric DEFAULT 0 NOT NULL,
    "reserved" numeric DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."account_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."aliases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "alias" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."aliases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."strategy_allocations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "strategy_id" "uuid" NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "protocol_id" "uuid",
    "target_pct" numeric(5,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "strategy_allocations_target_pct_check" CHECK ((("target_pct" >= (0)::numeric) AND ("target_pct" <= (100)::numeric)))
);


ALTER TABLE "public"."strategy_allocations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."allocations" AS
 SELECT "id",
    "strategy_id",
    "asset_id",
    "target_pct" AS "target_weight"
   FROM "public"."strategy_allocations" "sa";


ALTER VIEW "public"."allocations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "symbol" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(20,8) DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text",
    "table_name" "text",
    "record_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crypto_deposit_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "payment_intent_id" "uuid",
    "asset" "text",
    "network" "text",
    "amount" numeric,
    "tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."crypto_deposit_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deposit_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset" "text" DEFAULT 'USDC'::"text" NOT NULL,
    "network" "text" DEFAULT 'base'::"text" NOT NULL,
    "address" "text" NOT NULL,
    "label" "text",
    "provider" "text" DEFAULT 'address_pool'::"text" NOT NULL,
    "provider_reference" "text",
    "status" "text" DEFAULT 'available'::"text" NOT NULL,
    "assigned_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deposit_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deposits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "wallet_address" "text",
    "amount" numeric DEFAULT 0,
    "currency" "text" DEFAULT 'USD'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "tx_hash" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."deposits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."holdings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "amount" numeric(30,8) DEFAULT 0 NOT NULL,
    "value" numeric(20,2) DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."holdings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "asset" "text",
    "network" "text",
    "amount" numeric,
    "direction" "text",
    "source" "text",
    "reference_id" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ledger_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."market_signals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "signal_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "impact_level" "public"."impact_level_type" DEFAULT 'medium'::"public"."impact_level_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."market_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onchain_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chain" "text" NOT NULL,
    "tx_hash" "text",
    "from_address" "text",
    "to_address" "text",
    "amount" numeric,
    "confirmed" boolean DEFAULT false,
    "raw_data" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."onchain_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_intents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "amount" numeric,
    "method" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "asset" "text" DEFAULT 'USDC'::"text",
    "network" "text" DEFAULT 'base'::"text",
    "deposit_address" "text",
    "stripe_session_id" "text",
    "stripe_payment_status" "text",
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."payment_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_deposit_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chain" "text" NOT NULL,
    "address" "text" NOT NULL,
    "token" "text",
    "environment" "text" DEFAULT 'prod'::"text",
    "active" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."platform_deposit_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_value" numeric(20,2) DEFAULT 0 NOT NULL,
    "risk_profile" "public"."risk_profile_type" DEFAULT 'balanced'::"public"."risk_profile_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."portfolios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "display_name" "text",
    "avatar_url" "text",
    "tier" "text" DEFAULT 'private'::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."protocols" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "protocol_type" "public"."protocol_type" NOT NULL,
    "chain" "text" DEFAULT 'ethereum'::"text" NOT NULL,
    "apy_rate" numeric(8,4) DEFAULT 0 NOT NULL,
    "risk_tier" "public"."risk_tier" DEFAULT 'medium'::"public"."risk_tier" NOT NULL,
    "status" "public"."protocol_status" DEFAULT 'active'::"public"."protocol_status" NOT NULL,
    "tvl_usd" numeric(20,2) DEFAULT 0,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."protocols" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rebalancing_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "trigger_type" "public"."rebalance_trigger" DEFAULT 'manual'::"public"."rebalance_trigger" NOT NULL,
    "previous_value" numeric(20,2) DEFAULT 0 NOT NULL,
    "new_value" numeric(20,2) DEFAULT 0 NOT NULL,
    "drift_pct" numeric(8,4) DEFAULT 0,
    "notes" "text",
    "executed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rebalancing_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_scores" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "score" numeric(5,2) NOT NULL,
    "tier" "public"."risk_tier" DEFAULT 'medium'::"public"."risk_tier" NOT NULL,
    "volatility_index" numeric(8,4) DEFAULT 0,
    "concentration_risk" numeric(5,2) DEFAULT 0,
    "protocol_risk" numeric(5,2) DEFAULT 0,
    "liquidity_risk" numeric(5,2) DEFAULT 0,
    "notes" "text",
    "calculated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "risk_scores_score_check" CHECK ((("score" >= (0)::numeric) AND ("score" <= (100)::numeric)))
);


ALTER TABLE "public"."risk_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whale_signals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "asset_id" "uuid",
    "symbol" "text" NOT NULL,
    "wallet_address" "text",
    "chain" "text" DEFAULT 'ethereum'::"text" NOT NULL,
    "direction" "public"."whale_direction" NOT NULL,
    "amount_usd" numeric(20,2) NOT NULL,
    "amount_tokens" numeric(30,8),
    "from_entity" "text",
    "to_entity" "text",
    "impact_level" "public"."impact_level_type" DEFAULT 'medium'::"public"."impact_level_type" NOT NULL,
    "tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."whale_signals" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."signals" AS
 SELECT "market_signals"."id",
    'market'::"text" AS "kind",
    "market_signals"."signal_type" AS "category",
    "market_signals"."description" AS "headline",
    ("market_signals"."impact_level")::"text" AS "impact_level",
    "market_signals"."created_at"
   FROM "public"."market_signals"
UNION ALL
 SELECT "whale_signals"."id",
    'whale'::"text" AS "kind",
    ("whale_signals"."direction")::"text" AS "category",
    "concat"(COALESCE("whale_signals"."from_entity", 'unknown'::"text"), ' → ', COALESCE("whale_signals"."to_entity", 'unknown'::"text"), ' | $', COALESCE(("whale_signals"."amount_usd")::"text", '0'::"text")) AS "headline",
    ("whale_signals"."impact_level")::"text" AS "impact_level",
    "whale_signals"."created_at"
   FROM "public"."whale_signals";


ALTER VIEW "public"."signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."strategies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "name" "text" DEFAULT 'Default Strategy'::"text" NOT NULL,
    "strategy_type" "public"."strategy_type" DEFAULT 'balanced'::"public"."strategy_type" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."strategies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan" "public"."subscription_plan" DEFAULT 'free'::"public"."subscription_plan" NOT NULL,
    "status" "public"."subscription_status" DEFAULT 'active'::"public"."subscription_status" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."transaction_type" NOT NULL,
    "amount" numeric(20,2) NOT NULL,
    "status" "public"."transaction_status" DEFAULT 'pending'::"public"."transaction_status" NOT NULL,
    "stripe_session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender_id" "uuid",
    "receiver_alias" "text",
    "currency" "text" DEFAULT 'USDC'::"text",
    "note" "text",
    CONSTRAINT "transactions_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_deposit_intents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "chain" "text" NOT NULL,
    "expected_amount" numeric,
    "status" "text" DEFAULT 'pending'::"text",
    "reference_code" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_deposit_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."withdrawal_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "asset" "text",
    "network" "text",
    "amount" numeric,
    "destination_address" "text",
    "status" "text" DEFAULT 'pending_review'::"text",
    "tx_hash" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failure_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."withdrawal_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."yields" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "daily_yield" numeric(20,8) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."yields" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account_balances"
    ADD CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."account_balances"
    ADD CONSTRAINT "account_balances_user_id_asset_network_key" UNIQUE ("user_id", "asset", "network");



ALTER TABLE ONLY "public"."aliases"
    ADD CONSTRAINT "aliases_alias_key" UNIQUE ("alias");



ALTER TABLE ONLY "public"."aliases"
    ADD CONSTRAINT "aliases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_symbol_key" UNIQUE ("symbol");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crypto_deposit_events"
    ADD CONSTRAINT "crypto_deposit_events_network_tx_hash_key" UNIQUE ("network", "tx_hash");



ALTER TABLE ONLY "public"."crypto_deposit_events"
    ADD CONSTRAINT "crypto_deposit_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deposit_addresses"
    ADD CONSTRAINT "deposit_addresses_network_address_key" UNIQUE ("network", "address");



ALTER TABLE ONLY "public"."deposit_addresses"
    ADD CONSTRAINT "deposit_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deposit_addresses"
    ADD CONSTRAINT "deposit_addresses_user_id_asset_network_key" UNIQUE ("user_id", "asset", "network");



ALTER TABLE ONLY "public"."deposits"
    ADD CONSTRAINT "deposits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."holdings"
    ADD CONSTRAINT "holdings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."holdings"
    ADD CONSTRAINT "holdings_portfolio_asset_unique" UNIQUE ("portfolio_id", "asset_id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."market_signals"
    ADD CONSTRAINT "market_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onchain_transactions"
    ADD CONSTRAINT "onchain_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onchain_transactions"
    ADD CONSTRAINT "onchain_transactions_tx_hash_key" UNIQUE ("tx_hash");



ALTER TABLE ONLY "public"."payment_intents"
    ADD CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_deposit_addresses"
    ADD CONSTRAINT "platform_deposit_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."protocols"
    ADD CONSTRAINT "protocols_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."protocols"
    ADD CONSTRAINT "protocols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."protocols"
    ADD CONSTRAINT "protocols_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."rebalancing_events"
    ADD CONSTRAINT "rebalancing_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_scores"
    ADD CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."strategies"
    ADD CONSTRAINT "strategies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."strategies"
    ADD CONSTRAINT "strategies_portfolio_id_key" UNIQUE ("portfolio_id");



ALTER TABLE ONLY "public"."strategy_allocations"
    ADD CONSTRAINT "strategy_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."strategy_allocations"
    ADD CONSTRAINT "strategy_allocations_unique" UNIQUE ("strategy_id", "asset_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_deposit_intents"
    ADD CONSTRAINT "user_deposit_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_deposit_intents"
    ADD CONSTRAINT "user_deposit_intents_reference_code_key" UNIQUE ("reference_code");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."whale_signals"
    ADD CONSTRAINT "whale_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."yields"
    ADD CONSTRAINT "yields_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_alias_user" ON "public"."aliases" USING "btree" ("user_id");



CREATE INDEX "idx_assets_symbol" ON "public"."assets" USING "btree" ("symbol");



CREATE INDEX "idx_holdings_asset_id" ON "public"."holdings" USING "btree" ("asset_id");



CREATE INDEX "idx_holdings_portfolio_id" ON "public"."holdings" USING "btree" ("portfolio_id");



CREATE INDEX "idx_holdings_updated_at" ON "public"."holdings" USING "btree" ("updated_at");



CREATE INDEX "idx_market_signals_created_at" ON "public"."market_signals" USING "btree" ("created_at");



CREATE INDEX "idx_market_signals_impact_level" ON "public"."market_signals" USING "btree" ("impact_level");



CREATE INDEX "idx_payment_intents_user" ON "public"."payment_intents" USING "btree" ("user_id");



CREATE INDEX "idx_portfolios_created_at" ON "public"."portfolios" USING "btree" ("created_at");



CREATE INDEX "idx_portfolios_user_id" ON "public"."portfolios" USING "btree" ("user_id");



CREATE INDEX "idx_protocols_chain" ON "public"."protocols" USING "btree" ("chain");



CREATE INDEX "idx_protocols_status" ON "public"."protocols" USING "btree" ("status");



CREATE INDEX "idx_protocols_type" ON "public"."protocols" USING "btree" ("protocol_type");



CREATE INDEX "idx_rebalancing_created_at" ON "public"."rebalancing_events" USING "btree" ("created_at");



CREATE INDEX "idx_rebalancing_portfolio_id" ON "public"."rebalancing_events" USING "btree" ("portfolio_id");



CREATE INDEX "idx_rebalancing_trigger" ON "public"."rebalancing_events" USING "btree" ("trigger_type");



CREATE INDEX "idx_risk_scores_calculated_at" ON "public"."risk_scores" USING "btree" ("calculated_at");



CREATE INDEX "idx_risk_scores_portfolio_id" ON "public"."risk_scores" USING "btree" ("portfolio_id");



CREATE INDEX "idx_risk_scores_tier" ON "public"."risk_scores" USING "btree" ("tier");



CREATE INDEX "idx_strategies_portfolio_id" ON "public"."strategies" USING "btree" ("portfolio_id");



CREATE INDEX "idx_strategies_type" ON "public"."strategies" USING "btree" ("strategy_type");



CREATE INDEX "idx_strategy_allocations_asset_id" ON "public"."strategy_allocations" USING "btree" ("asset_id");



CREATE INDEX "idx_strategy_allocations_protocol_id" ON "public"."strategy_allocations" USING "btree" ("protocol_id");



CREATE INDEX "idx_strategy_allocations_strategy_id" ON "public"."strategy_allocations" USING "btree" ("strategy_id");



CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "public"."subscriptions" USING "btree" ("stripe_customer_id") WHERE ("stripe_customer_id" IS NOT NULL);



CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "public"."subscriptions" USING "btree" ("stripe_subscription_id") WHERE ("stripe_subscription_id" IS NOT NULL);



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_created_at" ON "public"."transactions" USING "btree" ("created_at");



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE INDEX "idx_transactions_stripe" ON "public"."transactions" USING "btree" ("stripe_session_id") WHERE ("stripe_session_id" IS NOT NULL);



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "idx_tx_receiver" ON "public"."transactions" USING "btree" ("receiver_alias");



CREATE INDEX "idx_tx_sender" ON "public"."transactions" USING "btree" ("sender_id");



CREATE INDEX "idx_whale_signals_amount_usd" ON "public"."whale_signals" USING "btree" ("amount_usd" DESC);



CREATE INDEX "idx_whale_signals_asset_id" ON "public"."whale_signals" USING "btree" ("asset_id");



CREATE INDEX "idx_whale_signals_created_at" ON "public"."whale_signals" USING "btree" ("created_at");



CREATE INDEX "idx_whale_signals_direction" ON "public"."whale_signals" USING "btree" ("direction");



CREATE INDEX "idx_whale_signals_symbol" ON "public"."whale_signals" USING "btree" ("symbol");



CREATE INDEX "idx_yields_created_at" ON "public"."yields" USING "btree" ("created_at");



CREATE INDEX "idx_yields_portfolio_id" ON "public"."yields" USING "btree" ("portfolio_id");



CREATE OR REPLACE TRIGGER "trg_holdings_updated_at" BEFORE UPDATE ON "public"."holdings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_on_portfolio_created" AFTER INSERT ON "public"."portfolios" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_portfolio"();



CREATE OR REPLACE TRIGGER "trg_prevent_rebalancing_update" BEFORE UPDATE ON "public"."rebalancing_events" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_rebalancing_update"();



CREATE OR REPLACE TRIGGER "trg_protocols_updated_at" BEFORE UPDATE ON "public"."protocols" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_strategies_updated_at" BEFORE UPDATE ON "public"."strategies" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_strategy_allocations_updated_at" BEFORE UPDATE ON "public"."strategy_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_validate_strategy_allocation" BEFORE INSERT OR UPDATE ON "public"."strategy_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."validate_strategy_allocation_total"();



ALTER TABLE ONLY "public"."account_balances"
    ADD CONSTRAINT "account_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."aliases"
    ADD CONSTRAINT "aliases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deposit_addresses"
    ADD CONSTRAINT "deposit_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deposits"
    ADD CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."holdings"
    ADD CONSTRAINT "holdings_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."holdings"
    ADD CONSTRAINT "holdings_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payment_intents"
    ADD CONSTRAINT "payment_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rebalancing_events"
    ADD CONSTRAINT "rebalancing_events_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rebalancing_events"
    ADD CONSTRAINT "rebalancing_events_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_scores"
    ADD CONSTRAINT "risk_scores_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strategies"
    ADD CONSTRAINT "strategies_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strategy_allocations"
    ADD CONSTRAINT "strategy_allocations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."strategy_allocations"
    ADD CONSTRAINT "strategy_allocations_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "public"."protocols"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."strategy_allocations"
    ADD CONSTRAINT "strategy_allocations_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_deposit_intents"
    ADD CONSTRAINT "user_deposit_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whale_signals"
    ADD CONSTRAINT "whale_signals_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."withdrawal_requests"
    ADD CONSTRAINT "withdrawal_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."yields"
    ADD CONSTRAINT "yields_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can read aliases" ON "public"."aliases" FOR SELECT USING (true);



CREATE POLICY "No public access to transactions" ON "public"."onchain_transactions" FOR SELECT USING (false);



CREATE POLICY "User can create payment intent" ON "public"."payment_intents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can create transaction" ON "public"."transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "User can insert own alias" ON "public"."aliases" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can update own alias" ON "public"."aliases" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "User can view own payment intents" ON "public"."payment_intents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can view own transactions" ON "public"."transactions" FOR SELECT USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can insert own deposits" ON "public"."user_deposit_intents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own deposits" ON "public"."user_deposit_intents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own ledger" ON "public"."ledger_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."account_balances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."aliases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."crypto_deposit_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deposit_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deposits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."holdings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "holdings_select_own" ON "public"."holdings" FOR SELECT USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_insert_public" ON "public"."leads" FOR INSERT WITH CHECK (true);



CREATE POLICY "leads_select_service_only" ON "public"."leads" FOR SELECT USING (false);



ALTER TABLE "public"."ledger_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."market_signals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "market_signals_select_all" ON "public"."market_signals" FOR SELECT USING (true);



ALTER TABLE "public"."onchain_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_intents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_deposit_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portfolios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "portfolios_select_own" ON "public"."portfolios" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "portfolios_update_own" ON "public"."portfolios" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."protocols" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "protocols_select_all" ON "public"."protocols" FOR SELECT USING (true);



ALTER TABLE "public"."rebalancing_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rebalancing_events_select_own" ON "public"."rebalancing_events" FOR SELECT USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."risk_scores" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "risk_scores_select_own" ON "public"."risk_scores" FOR SELECT USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));



CREATE POLICY "service_role_only_insert" ON "public"."audit_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."strategies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "strategies_select_own" ON "public"."strategies" FOR SELECT USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));



CREATE POLICY "strategies_update_own" ON "public"."strategies" FOR UPDATE USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."strategy_allocations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "strategy_allocations_select_own" ON "public"."strategy_allocations" FOR SELECT USING (("strategy_id" IN ( SELECT "s"."id"
   FROM ("public"."strategies" "s"
     JOIN "public"."portfolios" "p" ON (("p"."id" = "s"."portfolio_id")))
  WHERE ("p"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_select_own" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "transactions_select_own" ON "public"."transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_deposit_intents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."whale_signals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whale_signals_select_all" ON "public"."whale_signals" FOR SELECT USING (true);



ALTER TABLE "public"."withdrawal_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."yields" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "yields_select_own" ON "public"."yields" FOR SELECT USING (("portfolio_id" IN ( SELECT "portfolios"."id"
   FROM "public"."portfolios"
  WHERE ("portfolios"."user_id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."deposits";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ledger_entries";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."admin_add_deposit_address"("p_asset" "text", "p_network" "text", "p_address" "text", "p_provider" "text", "p_provider_reference" "text", "p_label" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_add_deposit_address"("p_asset" "text", "p_network" "text", "p_address" "text", "p_provider" "text", "p_provider_reference" "text", "p_label" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_add_deposit_address"("p_asset" "text", "p_network" "text", "p_address" "text", "p_provider" "text", "p_provider_reference" "text", "p_label" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."confirm_crypto_deposit"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_tx_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_crypto_deposit"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_tx_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_crypto_deposit"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_tx_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."confirm_payment_intent"("p_payment_intent_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_payment_intent"("p_payment_intent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_payment_intent"("p_payment_intent_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_withdrawal_request"("p_asset" "text", "p_network" "text", "p_amount" numeric, "p_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_withdrawal_request"("p_asset" "text", "p_network" "text", "p_amount" numeric, "p_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_withdrawal_request"("p_asset" "text", "p_network" "text", "p_amount" numeric, "p_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."credit_balance"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_source" "text", "p_reference_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."credit_balance"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_source" "text", "p_reference_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."credit_balance"("p_user_id" "uuid", "p_asset" "text", "p_network" "text", "p_amount" numeric, "p_source" "text", "p_reference_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_portfolio"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_portfolio"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_portfolio"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_rebalancing_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_rebalancing_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_rebalancing_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_strategy_allocation_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_strategy_allocation_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_strategy_allocation_total"() TO "service_role";
























GRANT ALL ON TABLE "public"."account_balances" TO "anon";
GRANT ALL ON TABLE "public"."account_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."account_balances" TO "service_role";



GRANT ALL ON TABLE "public"."aliases" TO "anon";
GRANT ALL ON TABLE "public"."aliases" TO "authenticated";
GRANT ALL ON TABLE "public"."aliases" TO "service_role";



GRANT ALL ON TABLE "public"."strategy_allocations" TO "anon";
GRANT ALL ON TABLE "public"."strategy_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."strategy_allocations" TO "service_role";



GRANT ALL ON TABLE "public"."allocations" TO "anon";
GRANT ALL ON TABLE "public"."allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."allocations" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."crypto_deposit_events" TO "anon";
GRANT ALL ON TABLE "public"."crypto_deposit_events" TO "authenticated";
GRANT ALL ON TABLE "public"."crypto_deposit_events" TO "service_role";



GRANT ALL ON TABLE "public"."deposit_addresses" TO "anon";
GRANT ALL ON TABLE "public"."deposit_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."deposit_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."deposits" TO "anon";
GRANT ALL ON TABLE "public"."deposits" TO "authenticated";
GRANT ALL ON TABLE "public"."deposits" TO "service_role";



GRANT ALL ON TABLE "public"."holdings" TO "anon";
GRANT ALL ON TABLE "public"."holdings" TO "authenticated";
GRANT ALL ON TABLE "public"."holdings" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_entries" TO "anon";
GRANT ALL ON TABLE "public"."ledger_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_entries" TO "service_role";



GRANT ALL ON TABLE "public"."market_signals" TO "anon";
GRANT ALL ON TABLE "public"."market_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."market_signals" TO "service_role";



GRANT ALL ON TABLE "public"."onchain_transactions" TO "anon";
GRANT ALL ON TABLE "public"."onchain_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."onchain_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."payment_intents" TO "anon";
GRANT ALL ON TABLE "public"."payment_intents" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_intents" TO "service_role";



GRANT ALL ON TABLE "public"."platform_deposit_addresses" TO "anon";
GRANT ALL ON TABLE "public"."platform_deposit_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_deposit_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."portfolios" TO "anon";
GRANT ALL ON TABLE "public"."portfolios" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolios" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."protocols" TO "anon";
GRANT ALL ON TABLE "public"."protocols" TO "authenticated";
GRANT ALL ON TABLE "public"."protocols" TO "service_role";



GRANT ALL ON TABLE "public"."rebalancing_events" TO "anon";
GRANT ALL ON TABLE "public"."rebalancing_events" TO "authenticated";
GRANT ALL ON TABLE "public"."rebalancing_events" TO "service_role";



GRANT ALL ON TABLE "public"."risk_scores" TO "anon";
GRANT ALL ON TABLE "public"."risk_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_scores" TO "service_role";



GRANT ALL ON TABLE "public"."whale_signals" TO "anon";
GRANT ALL ON TABLE "public"."whale_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."whale_signals" TO "service_role";



GRANT ALL ON TABLE "public"."signals" TO "anon";
GRANT ALL ON TABLE "public"."signals" TO "authenticated";
GRANT ALL ON TABLE "public"."signals" TO "service_role";



GRANT ALL ON TABLE "public"."strategies" TO "anon";
GRANT ALL ON TABLE "public"."strategies" TO "authenticated";
GRANT ALL ON TABLE "public"."strategies" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_deposit_intents" TO "anon";
GRANT ALL ON TABLE "public"."user_deposit_intents" TO "authenticated";
GRANT ALL ON TABLE "public"."user_deposit_intents" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."withdrawal_requests" TO "anon";
GRANT ALL ON TABLE "public"."withdrawal_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."withdrawal_requests" TO "service_role";



GRANT ALL ON TABLE "public"."yields" TO "anon";
GRANT ALL ON TABLE "public"."yields" TO "authenticated";
GRANT ALL ON TABLE "public"."yields" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































revoke references on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

CREATE TRIGGER trg_on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


