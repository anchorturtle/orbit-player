// Serve WAVs with byte-range support (Pages static only returns 200 for .wav since it isn't edge-cached)
export async function onRequest(context) {
  const req = context.request;
  const range = req.headers.get('Range');
  const res = await context.next();
  if (res.status !== 200 && res.status !== 206) return res;
  if (res.status === 206) return res;
  const size = Number(res.headers.get('Content-Length'));
  const h = new Headers(res.headers);
  h.set('Accept-Ranges', 'bytes');
  h.set('Content-Type', 'audio/wav');
  h.delete('Content-Encoding');
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || !(size > 0) || (m[1] === '' && m[2] === '')) return new Response(req.method === 'HEAD' ? null : res.body, { status: 200, headers: h });
  let start, end;
  if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) {
    if (res.body) res.body.cancel();
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
  }
  h.set('Content-Range', `bytes ${start}-${end}/${size}`);
  h.set('Content-Length', String(end - start + 1));
  if (req.method === 'HEAD') { if (res.body) res.body.cancel(); return new Response(null, { status: 206, headers: h }); }
  let pos = 0;
  const want = end - start + 1;
  let sent = 0;
  const reader = res.body.getReader();
  const body = new ReadableStream({
    async pull(ctrl) {
      while (true) {
        if (sent >= want) { reader.cancel(); ctrl.close(); return; }
        const { value, done } = await reader.read();
        if (done) { ctrl.close(); return; }
        const cs = pos, ce = pos + value.length; pos = ce;
        if (ce <= start) continue;
        const a = Math.max(0, start - cs);
        const b = Math.min(value.length, a + (want - sent));
        const chunk = value.subarray(a, b);
        sent += chunk.length;
        ctrl.enqueue(chunk);
        return;
      }
    },
    cancel() { reader.cancel(); }
  });
  return new Response(body, { status: 206, headers: h });
}
