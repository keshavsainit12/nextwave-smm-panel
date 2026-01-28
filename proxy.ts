export default async function proxy(req: Request) {
  const targetBase = process.env.PROXY_TARGET_URL
  if (!targetBase) {
    console.error("[proxy] PROXY_TARGET_URL not set")
    return new Response(JSON.stringify({ error: "Proxy target not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }

  const url = new URL(req.url)
  const forwardUrl = `${targetBase}${url.pathname}${url.search}`

  const outHeaders = new Headers()
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === "host") return
    outHeaders.set(key, value)
  })

  if (process.env.PROXY_ADD_HEADER_KEY && process.env.PROXY_ADD_HEADER_VALUE) {
    outHeaders.set(process.env.PROXY_ADD_HEADER_KEY, process.env.PROXY_ADD_HEADER_VALUE)
  }

  try {
    const res = await fetch(forwardUrl, {
      method: req.method,
      headers: outHeaders,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      redirect: "manual",
    })

    const responseHeaders = new Headers(res.headers)
    responseHeaders.delete("transfer-encoding")

    const body = await res.arrayBuffer()
    return new Response(body, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    console.error("[proxy] forward error:", err)
    return new Response(JSON.stringify({ error: "Proxy forward error", details: String(err) }), {
      status: 502,
      headers: { "content-type": "application/json" },
    })
  }
}