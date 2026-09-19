import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAccessingAdmin = request.nextUrl.pathname.startsWith('/admin')

  // Halaman di bawah /admin yang harus tetap bisa diakses tanpa login —
  // memang dirancang untuk orang yang belum/tidak bisa login:
  // - /admin/login            : halaman login itu sendiri
  // - /admin/forgot-password  : minta link reset password
  // ('/set-password' sengaja tidak dimasukkan sini karena route-nya
  //  di app/(public)/set-password, jadi URL-nya '/set-password', bukan
  //  '/admin/set-password' — di luar cakupan matcher middleware ini)
  const publicAdminPaths = ['/admin/login', '/admin/forgot-password']
  const isPublicAdminPath = publicAdminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAccessingAdmin && !isPublicAdminPath && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin/login') && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}