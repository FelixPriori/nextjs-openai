import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { getAppProps } from "../utils/getAppProps";
import AppLayout from "../components/AppLayout/AppLayout";

export default function Success() {
  return (
    <div className="h-full overflow-hidden">
      <div className="w-full h-full flex flex-col overflow-auto">
        <div className="bs-card">
          <h2 className="text-center">Thank you for your purchase!</h2>
        </div>
      </div>
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