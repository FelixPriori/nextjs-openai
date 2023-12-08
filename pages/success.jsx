import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { getAppProps } from "../utils/getAppProps";
import AppLayout from "../components/AppLayout/AppLayout";

export default function Success() {
  return (
    <div>
      Thank you for your purchase.
    </div>
  )
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx)
    return {
      props
    }
  }
})