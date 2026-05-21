import { useMemo } from "react"
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Bell, Bookmark, Compass, ImagePlus, MessageCircle, PlusCircle, Search, ShieldCheck, Tag, Users } from 'lucide-react'
import { useUserContext } from '@/context/AuthContext'
import { useGetAllUsers } from '@/lib/react-query/queries'
import Loader from './Loader'
import CreatorDiscoveryCard from './CreatorDiscoveryCard'

const QuickAction = ({ to, icon: Icon, title, caption }: { to: string; icon: any; title: string; caption: string }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-2xl border border-dark-4 bg-dark-3/70 p-3 transition hover:border-primary-500/50 hover:bg-dark-4"
  >
    <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-primary-500/12 text-primary-500">
      <Icon size={19} />
    </span>
    <span className="min-w-0">
      <span className="block text-light-1 small-semibold">{title}</span>
      <span className="block truncate text-light-4 tiny-medium">{caption}</span>
    </span>
  </Link>
);

const SuggestedCreators = () => {
  const { user } = useUserContext();
  const { data: users = [], isLoading } = useGetAllUsers();
  const suggestedCreators = useMemo(
    () =>
      users
        .filter((creator: any) => creator._id !== user?._id)
        .sort((firstCreator: any, secondCreator: any) => (secondCreator?.followers?.length || 0) - (firstCreator?.followers?.length || 0))
        .slice(0, 5),
    [user?._id, users]
  );

  return (
    <section className="content-panel rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Creators</p>
          <h2 className="body-bold">People to watch</h2>
        </div>
        <Users size={22} className="text-primary-500" />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-3">
          {suggestedCreators.map((creator: any) => (
            <CreatorDiscoveryCard key={creator._id} creator={creator} />
          ))}
        </div>
      )}

      <Link to="/all-users" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-white small-semibold transition hover:bg-primary-600">
        Explore people
      </Link>
    </section>
  );
};

const HomeSidebar = () => (
  <div className="flex flex-col gap-5 px-5">
    <SuggestedCreators />

    <section className="content-panel rounded-3xl p-5">
      <div className="mb-5">
        <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Quick actions</p>
        <h2 className="body-bold">Move faster</h2>
      </div>
      <div className="flex flex-col gap-3">
        <QuickAction to="/create-post" icon={PlusCircle} title="Create post" caption="Text, images, video" />
        <QuickAction to="/explore" icon={Compass} title="Explore" caption="Find posts and tags" />
        <QuickAction to="/message" icon={MessageCircle} title="Messages" caption="Open direct chats" />
        <QuickAction to="/notifications" icon={Bell} title="Notifications" caption="Catch up on activity" />
      </div>
    </section>
  </div>
);

const CreatePostSidebar = () => {
  const { user } = useUserContext();

  return (
    <div className="flex flex-col gap-5 px-5">
      <section className="content-panel rounded-3xl p-5">
        <div className="mb-5">
          <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Composer</p>
          <h2 className="body-bold">Post shortcuts</h2>
        </div>
        <div className="flex flex-col gap-3">
          <QuickAction to="/explore" icon={Search} title="Research trends" caption="Check active tags" />
          <QuickAction to="/all-users" icon={Tag} title="Find people to tag" caption="Mention relevant creators" />
          <QuickAction to={`/profile/${user?._id}`} icon={Bookmark} title="Review saved posts" caption="Use your saved ideas" />
        </div>
      </section>

      <section className="content-panel rounded-3xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="small-semibold uppercase tracking-[0.24em] text-light-4">Checklist</p>
            <h2 className="body-bold">Before publishing</h2>
          </div>
          <ImagePlus size={22} className="text-primary-500" />
        </div>
        <div className="flex flex-col gap-3 text-light-3 small-regular">
          <div className="rounded-2xl bg-dark-3/70 p-3">Add a strong caption or context.</div>
          <div className="rounded-2xl bg-dark-3/70 p-3">Attach media when it improves the story.</div>
          <div className="rounded-2xl bg-dark-3/70 p-3">Tag people and add a location when useful.</div>
        </div>
      </section>

      <section className="content-panel rounded-3xl p-5">
        <QuickAction to="/change-password" icon={ShieldCheck} title="Account security" caption="Manage your password" />
      </section>
    </div>
  );
};

const RightSidebar = () => {
const {pathname}=useLocation()
const isHome = pathname=='/'
const isCreatePost = pathname === '/create-post' || pathname.includes('/update-post')
  return (
    <nav className='rightsidebar'>
  {isHome ? <HomeSidebar /> : isCreatePost ? <CreatePostSidebar /> : <HomeSidebar />}
    </nav>
  )
}

export default RightSidebar
