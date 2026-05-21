import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type CreatorDiscoveryCardProps = {
  creator: any;
};

const CreatorDiscoveryCard = ({ creator }: CreatorDiscoveryCardProps) => (
  <Link
    to={`/profile/${creator._id}`}
    className="flex items-center gap-3 rounded-2xl border border-dark-4 bg-dark-3/70 p-3 transition hover:border-primary-500/50 hover:bg-dark-4"
  >
    <img
      src={creator?.imageUrl || "/assets/images/default_user_image.png"}
      alt={creator?.name || "Creator"}
      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-light-1 small-semibold">{creator.name}</span>
      <span className="block truncate text-light-4 tiny-medium">@{creator.username}</span>
    </span>
    <ArrowRight size={16} className="text-light-4" />
  </Link>
);

export default CreatorDiscoveryCard;
