
import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * Memastikan Supabase sudah dikonfigurasi.
 */
const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Periksa SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di backend/.env."
    );
  }

  return supabase;
};

/**
 * GET /api/tracks
 * GET /api/tracks?q=ocean
 * GET /api/tracks?limit=10
 */
router.get("/", async (req, res) => {
  try {
    const client = getSupabaseClient();

    const search = String(req.query.q ?? "")
      .trim()
      .slice(0, 100);

    const requestedLimit = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);

    let query = client
      .from("tracks")
      .select(
        "id, title, artist, album, cover_url, audio_url, duration_seconds"
      )
      .order("created_at", { ascending: true })
      .limit(limit);

    if (search) {
      const safeSearch = search.replace(/[,%().*]/g, "").trim();

      if (!safeSearch) {
        return res.json({
          data: [],
          count: 0,
        });
      }

      query = query.or(
        `title.ilike.%${safeSearch}%,artist.ilike.%${safeSearch}%,album.ilike.%${safeSearch}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase catalog error:", error.message);

      return res.status(500).json({
        error: "Gagal mengambil katalog lagu.",
        details: error.message,
      });
    }

    return res.status(200).json({
      data: data ?? [],
      count: data?.length ?? 0,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Kesalahan tidak diketahui.";

    console.error("Kesalahan endpoint katalog:", message);

    if (message.includes("Supabase belum dikonfigurasi")) {
      return res.status(503).json({
        error: "Database belum dikonfigurasi.",
        details: message,
      });
    }

    return res.status(500).json({
      error: "Terjadi kesalahan pada server.",
    });
  }
});

/**
 * GET /api/tracks/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const client = getSupabaseClient();
    const trackId = req.params.id;

    const { data, error } = await client
      .from("tracks")
      .select(
        "id, title, artist, album, cover_url, audio_url, duration_seconds"
      )
      .eq("id", trackId)
      .maybeSingle();

    if (error) {
      console.error("Supabase track detail error:", error.message);

      return res.status(500).json({
        error: "Gagal mengambil detail lagu.",
        details: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "Lagu tidak ditemukan.",
      });
    }

    return res.status(200).json({
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Kesalahan tidak diketahui.";

    console.error("Kesalahan endpoint detail lagu:", message);

    if (message.includes("Supabase belum dikonfigurasi")) {
      return res.status(503).json({
        error: "Database belum dikonfigurasi.",
        details: message,
      });
    }

    return res.status(500).json({
      error: "Terjadi kesalahan pada server.",
    });
  }
});

export default router;
