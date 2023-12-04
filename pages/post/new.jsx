import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function NewPost() {
  return <div>This is the new post page</div>;
}

export const getServerSideProps = withPageAuthRequired(() => {
  return { props: {} }
})