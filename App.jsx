// ════════════════════════════════════════════════════════════════════════════
// lib.js — Supabase client + API layer
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const API_URL = import.meta.env.VITE_API_URL || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  signUp:  (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),
  signIn:  (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  session: () => supabase.auth.getSession(),
  onChange:(cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Channels (real, persisted to Supabase) ──────────────────────────────────
export const channelsApi = {
  list: async (userId) => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  create: async (channel) => {
    const { data, error } = await supabase
      .from("channels")
      .insert(channel)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    const { error } = await supabase.from("channels").delete().eq("id", id);
    if (error) throw error;
  },
};

// ── Claude via backend (server holds the API key) ────────────────────────────
export const ai = {
  // generate channel name ideas
  names: async (niche, nicheDesc, token) => {
    const r = await fetch(`${API_URL}/api/ideas/names`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ niche, nicheDesc }),
    });
    if (!r.ok) throw new Error("names failed");
    return r.json();
  },
  // generate video ideas for a channel
  ideas: async (channelId, niche, channelName, token) => {
    const r = await fetch(`${API_URL}/api/ideas/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ channelId, niche, channelName }),
    });
    if (!r.ok) throw new Error("ideas failed");
    return r.json();
  },
};
