
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CSSProperties } from "react";
import RequireAuth from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";

type Track = {
  id: string | number;
  title: string;
  artist?: string | null;
  album?: string | null;
  audio_url: string;
  cover_url?: string | null;
  image_url?: string | null;
  artwork_url?: string | null;
  album_cover?: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const coverOf = (track: Track) =>
  track.cover_url ||
  track.image_url ||
  track.artwork_url ||
  track.album_cover ||
  "";

const gradients = [
  "linear-gradient(135deg,#123e7a,#111827 65%,#2563eb)",
  "linear-gradient(135deg,#153b56,#0b1224 65%,#0ea5e9)",
  "linear-gradient(135deg,#312e81,#111827 65%,#6366f1)",
  "linear-gradient(135deg,#164e63,#111827 65%,#06b6d4)",
  "linear-gradient(135deg,#1e3a8a,#0f172a 65%,#38bdf8)",
  "linear-gradient(135deg,#334155,#111827 65%,#3b82f6)",
];

function Cover({
  track,
  index = 0,
  className = "",
}: {
  track: Track;
  index?: number;
  className?: string;
}) {
  const image = coverOf(track);

  return (
    <div
      className={`vs-cover ${className}`}
      style={
        {
          "--cover-gradient": gradients[index % gradients.length],
        } as CSSProperties
      }
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={`Cover ${track.title}`} loading="lazy" />
      ) : (
        <div className="vs-cover-placeholder">
          <span>♪</span>
          <small>VIBESOUND</small>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tracks`);

      if (!response.ok) {
        throw new Error(`Gagal mengambil lagu (${response.status}).`);
      }

      const payload = await response.json();

      const list: Track[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.tracks)
          ? payload.tracks
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setTracks(list);

      setCurrentTrack((previous) => {
        if (!previous) return list[0] ?? null;

        return (
          list.find((track) => track.id === previous.id) ??
          list[0] ??
          null
        );
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil lagu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTracks();

    void supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
    });
  }, [fetchTracks]);

  const filteredTracks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tracks;

    return tracks.filter((track) =>
      [
        track.title,
        track.artist ?? "",
        track.album ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [tracks, search]);

  const playTrack = (track: Track) => {
    if (!track.audio_url) {
      setError("URL audio untuk lagu ini belum tersedia.");
      return;
    }

    setError("");
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleLogout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError("Logout gagal. Coba lagi.");
    } else {
      window.location.href = "/login";
    }
  };

  const displayName = userEmail
    ? userEmail.split("@")[0]
    : "Listener";

  return (
    <main className="vs-app">
      <aside className="vs-sidebar">
        <a href="/" className="vs-brand">
          <span className="vs-brand-icon">♫</span>
          <span>
            Vibe<span className="vs-brand-accent">Sound</span>
          </span>
        </a>

        <div className="vs-nav-label">MENU</div>

        <nav className="vs-nav">
          <a href="#home" className="vs-nav-item active">
            <span className="vs-nav-icon">⌂</span>
            Home
          </a>

          <a href="#discover" className="vs-nav-item">
            <span className="vs-nav-icon">✧</span>
            Discover
          </a>

          <a href="#library" className="vs-nav-item">
            <span className="vs-nav-icon">▤</span>
            Your Library
          </a>
        </nav>

        <div className="vs-sidebar-divider" />

        <div className="vs-nav-label">YOUR MUSIC</div>

        <nav className="vs-nav">
          <a href="#tracks" className="vs-nav-item">
            <span className="vs-nav-icon">♫</span>
            All Tracks
          </a>

          <a href="#player" className="vs-nav-item">
            <span className="vs-nav-icon">◷</span>
            Now Playing
          </a>
        </nav>

        <div className="vs-sidebar-bottom">
          <div className="vs-sidebar-glow">
            <span className="vs-glow-symbol">✦</span>
            <p className="vs-glow-title">Your vibe, your world.</p>
            <p className="vs-glow-text">
              Temukan musik yang cocok dengan suasana hatimu.
            </p>
          </div>

          <div className="vs-profile">
            <div className="vs-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="vs-profile-info">
              <strong>{displayName}</strong>
              <span>Music listener</span>
            </div>

            <button
              className="vs-logout"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      <section className="vs-main" id="home">
        <header className="vs-topbar">
          <div className="vs-mobile-brand">
            <span className="vs-brand-icon">♫</span>
            Vibe<span className="vs-brand-accent">Sound</span>
          </div>

          <div className="vs-search">
            <span className="vs-search-icon">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari lagu, artis, atau album..."
              aria-label="Cari lagu, artis, atau album"
            />
            {search && (
              <button
                className="vs-clear-search"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <div className="vs-topbar-right">
            <span className="vs-status-dot" />
            <span className="vs-online-label">Music for your mood</span>
            <button
              className="vs-top-logout"
              onClick={handleLogout}
              title="Logout"
            >
              Keluar ↗
            </button>
          </div>
        </header>

        <div className="vs-content">
          <section className="vs-hero" id="discover">
            <div className="vs-hero-orb vs-orb-one" />
            <div className="vs-hero-orb vs-orb-two" />
            <div className="vs-hero-lines" />

            <div className="vs-hero-content">
              <div className="vs-eyebrow">
                <span className="vs-eyebrow-dot" />
                YOUR PERSONAL SOUNDSPACE
              </div>

              <h1>
                Feel every beat.
                <br />
                <span>Live your vibe.</span>
              </h1>

              <p>
                Musik yang tepat, di waktu yang tepat.
                Temukan suara yang mewakili dirimu.
              </p>

              <button
                className="vs-primary-button"
                onClick={() => {
                  const first = filteredTracks[0];
                  if (first) playTrack(first);
                  else document.getElementById("tracks")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                disabled={!filteredTracks.length}
              >
                <span>▶</span>
                Play your vibe
              </button>

              <div className="vs-hero-meta">
                <span>✦ Curated for you</span>
                <span className="vs-meta-separator">·</span>
                <span>{tracks.length} tracks available</span>
              </div>
            </div>

            <div className="vs-hero-art" aria-hidden="true">
              <div className="vs-art-ring vs-ring-one" />
              <div className="vs-art-ring vs-ring-two" />
              <div className="vs-art-ring vs-ring-three" />
              <div className="vs-art-center">
                <span>♫</span>
              </div>
              <div className="vs-floating-note note-one">♪</div>
              <div className="vs-floating-note note-two">♫</div>
              <div className="vs-floating-note note-three">♬</div>
              <div className="vs-equalizer">
                {[18, 32, 22, 42, 28, 48, 24, 36, 17, 31, 22, 40].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}px` }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="vs-hero-index">VS / 001</div>
          </section>

          {error && (
            <div className="vs-error" role="alert">
              <span>!</span>
              <p>{error}</p>
              <button onClick={() => setError("")} aria-label="Tutup">
                ×
              </button>
            </div>
          )}

          <section className="vs-section" id="library">
            <div className="vs-section-heading">
              <div>
                <div className="vs-section-kicker">HANDPICKED FOR YOU</div>
                <h2>
                  Made for <span>your mood.</span>
                </h2>
                <p className="vs-section-description">
                  Pilih lagu dan biarkan musik mengambil alih.
                </p>
              </div>

              <a href="#tracks" className="vs-text-link">
                Explore tracks <span>↗</span>
              </a>
            </div>

            {loading ? (
              <div className="vs-loading-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div className="vs-skeleton" key={item}>
                    <div className="vs-skeleton-cover" />
                    <div className="vs-skeleton-line" />
                    <div className="vs-skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : filteredTracks.length > 0 ? (
              <div className="vs-track-grid">
                {filteredTracks.slice(0, 4).map((track, index) => (
                  <button
                    className={`vs-track-card ${
                      currentTrack?.id === track.id ? "selected" : ""
                    }`}
                    key={track.id}
                    onClick={() => playTrack(track)}
                  >
                    <div className="vs-card-art-wrap">
                      <Cover track={track} index={index} />
                      <span className="vs-card-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="vs-card-play">
                        {currentTrack?.id === track.id && isPlaying
                          ? "♫"
                          : "▶"}
                      </span>
                    </div>

                    <div className="vs-card-info">
                      <strong title={track.title}>{track.title}</strong>
                      <span>{track.artist || "Unknown artist"}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="vs-empty">
                  <span>⌕</span>
                  <h3>{search ? "Lagu tidak ditemukan" : "Belum ada lagu"}</h3>
                  <p>
                    {search
                      ? "Coba kata kunci lain untuk menemukan musik."
                      : "Lagu dari backend akan muncul di sini."}
                  </p>
                  {search && (
                    <button
                      className="vs-secondary-button"
                      onClick={() => setSearch("")}
                    >
                      Tampilkan semua lagu
                    </button>
                  )}
                </div>
              )
            )}
          </section>

          <section className="vs-section vs-all-tracks" id="tracks">
            <div className="vs-section-heading vs-track-list-heading">
              <div>
                <div className="vs-section-kicker">THE COLLECTION</div>
                <h2>
                  All <span>tracks.</span>
                </h2>
                <p className="vs-section-description">
                  {search
                    ? `${filteredTracks.length} hasil untuk "${search}"`
                    : "Semua musik yang tersedia di VibeSound."}
                </p>
              </div>

              <button
                className="vs-refresh-button"
                onClick={() => void fetchTracks()}
                disabled={loading}
              >
                <span className={loading ? "vs-spinning" : ""}>↻</span>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="vs-list-loading">
                Sedang memuat koleksi musik...
              </div>
            ) : filteredTracks.length > 0 ? (
              <div className="vs-track-table">
                <div className="vs-table-header">
                  <span>#</span>
                  <span>TRACK</span>
                  <span className="vs-album-column">ALBUM</span>
                  <span className="vs-table-action-label">PLAY</span>
                </div>

                {filteredTracks.map((track, index) => (
                  <button
                    className={`vs-track-row ${
                      currentTrack?.id === track.id ? "playing" : ""
                    }`}
                    key={track.id}
                    onClick={() => playTrack(track)}
                  >
                    <span className="vs-row-number">
                      {currentTrack?.id === track.id && isPlaying
                        ? <span className="vs-playing-bars">▮▮</span>
                        : String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="vs-row-track">
                      <Cover
                        track={track}
                        index={index}
                        className="vs-row-cover"
                      />
                      <span className="vs-row-track-text">
                        <strong title={track.title}>{track.title}</strong>
                        <small>{track.artist || "Unknown artist"}</small>
                      </span>
                    </span>

                    <span className="vs-row-album">
                      {track.album || "Single"}
                    </span>

                    <span className="vs-row-play">
                      {currentTrack?.id === track.id && isPlaying
                        ? "♫"
                        : "▶"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="vs-empty vs-empty-list">
                <span>♫</span>
                <h3>Tidak ada lagu untuk ditampilkan</h3>
                <p>Coba refresh koleksi atau ubah pencarianmu.</p>
                <button
                  className="vs-secondary-button"
                  onClick={() => {
                    setSearch("");
                    void fetchTracks();
                  }}
                >
                  Muat ulang lagu
                </button>
              </div>
            )}
          </section>

          <footer className="vs-footer">
            <a href="#home" className="vs-footer-brand">
              Vibe<span>Sound</span>
            </a>
            <span>Made for the moments that matter.</span>
            <span className="vs-footer-version">VS — 001</span>
          </footer>
        </div>
      </section>

      <footer className="vs-player" id="player">
        <div className="vs-player-track">
          {currentTrack ? (
            <>
              <Cover track={currentTrack} className="vs-player-cover" />
              <div className="vs-player-track-info">
                <strong title={currentTrack.title}>
                  {currentTrack.title}
                </strong>
                <span>{currentTrack.artist || "Unknown artist"}</span>
              </div>
              <span className="vs-player-live-dot" />
            </>
          ) : (
            <div className="vs-player-track-info">
              <strong>Belum ada lagu dipilih</strong>
              <span>Pilih lagu untuk mulai mendengarkan</span>
            </div>
          )}
        </div>

        <div className="vs-player-center">
          <div className="vs-player-caption">
            <span className="vs-player-caption-dot" />
            NOW PLAYING
          </div>

          {currentTrack?.audio_url ? (
            <audio
              key={String(currentTrack.id) + currentTrack.audio_url}
              className="vs-audio"
              controls
              autoPlay
              preload="metadata"
              src={currentTrack.audio_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                setError(
                  "Audio tidak dapat diputar. Periksa URL audio atau koneksi server."
                );
              }}
            >
              Browser lo tidak mendukung pemutar audio.
            </audio>
          ) : (
            <div className="vs-player-placeholder">
              Pilih lagu untuk mulai memutar musik
            </div>
          )}
        </div>

        <div className="vs-player-right">
          <span className="vs-player-wave">▂ ▄ ▆ ▃ ▇ ▄</span>
          <span>Vibe mode</span>
        </div>
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
