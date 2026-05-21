import PostCard from './PostCard'

type GridPostListProps= {
posts:any[];
showUser?:boolean;
showStats?:boolean;
postId?:string|number;
}
const GridPostList = ({postId,posts}:GridPostListProps) => {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col'>
      {posts.map((post)=>(
        postId !== post._id && <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}

export default GridPostList
