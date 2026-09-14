const downloadPath = '/downloads/UACL_Support_Vehicle_App.pdf';
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== downloadPath) return env.ASSETS.fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status: 405});
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="UACL_Support_Vehicle_App.pdf"',
      'Content-Length': '56805100',
      'Cache-Control': 'public, max-age=3600'
    };
    if (request.method === 'HEAD') return new Response(null, {headers});
    const parts = await Promise.all([0, 1, 2].map(i => {
      const part = new URL('/downloads/uacl-part-' + i + '.bin', url);
      return env.ASSETS.fetch(new Request(part));
    }));
    if (parts.some(r => !r.ok)) return new Response('Download temporarily unavailable', {status: 503});
    const {readable, writable} = new TransformStream();
    ctx.waitUntil((async () => {
      const writer = writable.getWriter();
      try {
        for (const part of parts) {
          const reader = part.body.getReader();
          try {
            while (true) {
              const {done, value} = await reader.read();
              if (done) break;
              await writer.write(value);
            }
          } finally { reader.releaseLock(); }
        }
        await writer.close();
      } catch (error) { await writer.abort(error); }
    })());
    return new Response(readable, {headers});
  }
};
