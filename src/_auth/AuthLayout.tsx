import NetworkErrorPage from '@/_root/pages/NetworkErrorPage'
import BrandLogo from '@/components/ui/shared/BrandLogo'
import { useUserContext } from '@/context/AuthContext'
import { Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
const {internetError}=useUserContext()
if (internetError) return <NetworkErrorPage/>
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-dark-1 px-4 py-6 text-white custom-scrollbar md:px-8 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)] lg:gap-8 lg:overflow-hidden">
      <aside className="relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] border border-dark-4 bg-gray-900/80 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(135,126,255,0.28),transparent_22rem),radial-gradient(circle_at_84%_78%,rgba(93,95,239,0.22),transparent_26rem)]" />
        <div className="relative z-10">
          <BrandLogo />
          <p className="mt-3 small-regular text-white/50">Social moments, beautifully kept.</p>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-2xl gap-5">
          <div className="ml-auto w-[78%] rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary-500 bg-dark-4">
                <img src="/assets/images/profile.png" alt="creator" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="base-semibold">Mira Studio</p>
                <p className="small-regular text-white/45">shared a new status</p>
              </div>
            </div>
            <div className="mt-4 h-56 overflow-hidden rounded-2xl bg-dark-2">
              <img src="/assets/images/nature.jpg" alt="Postgram preview" className="h-full w-full object-cover" />
            </div>
            <div className="mt-4 flex items-center gap-4 text-white/75">
              <span className="inline-flex items-center gap-2"><Heart size={18} className="text-red" fill="currentColor" /> 18.4k</span>
              <span className="inline-flex items-center gap-2"><MessageCircle size={18} /> 942</span>
            </div>
          </div>

          <div className="w-[62%] rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
            <div className="mb-4 inline-flex rounded-full bg-primary-500/15 px-3 py-1 text-primary-500 small-semibold">
              Direct Message
            </div>
            <p className="body-bold">“Your latest post is stunning.”</p>
            <p className="mt-2 text-white/55 small-regular">Reply, react, and keep real conversations moving.</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            ["Secure auth", ShieldCheck],
            ["Status stories", Sparkles],
            ["Real chats", MessageCircle],
          ].map(([label, Icon]: any) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <Icon size={20} className="text-primary-500" />
              <p className="mt-3 small-semibold">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className='flex min-h-[calc(100vh-3rem)] items-center justify-center py-6 lg:py-0'>
        <Outlet/>
      </section>
    </div>
  )
}

export default AuthLayout
