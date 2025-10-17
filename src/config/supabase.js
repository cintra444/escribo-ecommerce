const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("URL da superbase e a chave de serviço são obrigatórios.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
