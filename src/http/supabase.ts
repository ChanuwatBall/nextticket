
import { createClient } from "@supabase/supabase-js";

const url = "https://nexexp-supabase.rubyclaw.tech"
const anonkey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcyMzIzMjAwLCJleHAiOjE5MzAwODk2MDB9.k4Y3Sfux8xgzlCsswl6WlufitEnYA7rciPfEiy3WYv8"

export const supabase = createClient(
    url,
    anonkey
);