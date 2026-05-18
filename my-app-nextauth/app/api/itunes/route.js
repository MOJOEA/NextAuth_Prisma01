export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const term = searchParams.get('term')

  if (!term) {
    return Response.json({ error: 'Missing term' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`
    )

    const data = await res.json()

    return Response.json(data)
  } catch (err) {
    return Response.json({ error: 'Fetch failed' }, { status: 500 })
  }
}