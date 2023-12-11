import { useState, useContext } from 'react'
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import AppLayout from "../../components/AppLayout/AppLayout";
import { useRouter } from 'next/router';
import PostsContext from '../../context/postsContext';

export default function Post({ postContent, title, metaDescription, keywords, id }) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deletePost } = useContext(PostsContext);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deletePost`, {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ postId: id })
      })

      const json = await response.json();

      if (json.success) {
        deletePost(id)
        router.replace("/post/new")
      }
    } catch (error) {
      console.error({ error })
    }
  }

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto" >
        <div className="text-sm font-bold mt-6 p2 bg-stone-200 rounded-sm">SEO title and meta description</div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{title}</div>
          <div className="mt-2">{metaDescription}</div>
        </div>
        <div className="text-sm font-bold mt-6 p2 bg-stone-200 rounded-sm">Keywords</div>
        <div className="flex flex-wrap pt-2 gap-1">
          {keywords.split(",").map(keyword => (
            <div className="p-2 rounded-full bg-slate-800 text-white" key={keyword}>
              <FontAwesomeIcon icon={faHashtag} /> {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p2 bg-stone-200 rounded-sm">Blog Post</div>
        <div dangerouslySetInnerHTML={{ __html: postContent || "" }}></div>
        <div className="my-4">
          {!showDeleteConfirm && (
            <button
              className="btn bg-red-600 hover:bg-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete post
            </button>
          )}
          {showDeleteConfirm && (
            <div>
              <p className="p-2 bg-red-300 text-center">
                Are you sure you want to delete this post? this action is irreversible!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn bg-stone-600 hover:bg-stone-700"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteConfirm}
                >
                  Confirm delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx)
    const userSession = await getSession(ctx.req, ctx.res)
    const client = await clientPromise;
    const db = client.db("BlogStandard")
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub
    })
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postId),
      userId: user._id
    })

    if (!post) {
      return {
        redirect: {
          destination: "/post/new",
          permanent: false
        }
      }
    }

    return {
      props: {
        id: ctx.params.postId,
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        postCreated: post.created.toString(),
        ...props,
      }
    }
  }
})