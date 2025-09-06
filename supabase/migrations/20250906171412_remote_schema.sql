drop extension if exists "pg_net";

create type "public"."payment_status" as enum ('paid', 'pending');

create type "public"."transaction_type" as enum ('income', 'expense');

drop policy "Admin can manage payment status" on "public"."payment_status";

drop policy "Admin can view all payment status" on "public"."payment_status";

drop policy "Users can view own payment status" on "public"."payment_status";

revoke delete on table "public"."payment_status" from "anon";

revoke insert on table "public"."payment_status" from "anon";

revoke references on table "public"."payment_status" from "anon";

revoke select on table "public"."payment_status" from "anon";

revoke trigger on table "public"."payment_status" from "anon";

revoke truncate on table "public"."payment_status" from "anon";

revoke update on table "public"."payment_status" from "anon";

revoke delete on table "public"."payment_status" from "authenticated";

revoke insert on table "public"."payment_status" from "authenticated";

revoke references on table "public"."payment_status" from "authenticated";

revoke select on table "public"."payment_status" from "authenticated";

revoke trigger on table "public"."payment_status" from "authenticated";

revoke truncate on table "public"."payment_status" from "authenticated";

revoke update on table "public"."payment_status" from "authenticated";

revoke delete on table "public"."payment_status" from "service_role";

revoke insert on table "public"."payment_status" from "service_role";

revoke references on table "public"."payment_status" from "service_role";

revoke select on table "public"."payment_status" from "service_role";

revoke trigger on table "public"."payment_status" from "service_role";

revoke truncate on table "public"."payment_status" from "service_role";

revoke update on table "public"."payment_status" from "service_role";

alter table "public"."payment_status" drop constraint "payment_status_bulan_check";

alter table "public"."payment_status" drop constraint "payment_status_created_by_fkey";

alter table "public"."payment_status" drop constraint "payment_status_tahun_check";

alter table "public"."payment_status" drop constraint "payment_status_user_uuid_bulan_tahun_key";

alter table "public"."payment_status" drop constraint "payment_status_user_uuid_fkey";

alter table "public"."payment_status" drop constraint "payment_status_pkey";

drop index if exists "public"."idx_payment_status_bulan_tahun";

drop index if exists "public"."idx_payment_status_created_by";

drop index if exists "public"."idx_payment_status_user_uuid";

drop index if exists "public"."payment_status_pkey";

drop index if exists "public"."payment_status_user_uuid_bulan_tahun_key";

drop table "public"."payment_status";

drop sequence if exists "public"."payment_status_id_seq";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (id, house_number, role, full_name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'house_number', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$function$
;


