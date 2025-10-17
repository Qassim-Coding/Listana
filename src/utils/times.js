export function secondsToHMS(totalSeconds = 0) {
const s = Math.max(0, Math.floor(totalSeconds));
const h = Math.floor(s / 3600);
const m = Math.floor((s % 3600) / 60);
const sec = s % 60;
const pad = (n) => String(n).padStart(2, "0");
return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}


export function hmsToSeconds(str = "") {
// Supports H:MM:SS or M:SS
if (!str) return 0;
const parts = str.split(":").map((p) => parseInt(p, 10)).filter((n) => !isNaN(n));
if (parts.length === 3) {
const [h, m, s] = parts;
return h * 3600 + m * 60 + s;
}
if (parts.length === 2) {
const [m, s] = parts;
return m * 60 + s;
}
if (parts.length === 1) {
return parts[0];
}
return 0;
}