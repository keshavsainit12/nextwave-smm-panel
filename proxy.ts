export default function proxy(request: Request) {
  // Temporary placeholder to satisfy Next.js build requirement.
  // Returns 204 No Content so app pages still build and deploy.
  return new Response(null, { status: 204 })
}