import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { getAppProps } from "../utils/getAppProps";
import AppLayout from "../components/AppLayout/AppLayout";

export default function TokenTopup() {
  const handleClick = async () => {
    const result = await fetch('/api/addTokens', {
      method: "POST",
    })

    const json = await result.json()

    window.location.href = json.session.url
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="w-full h-full flex flex-col overflow-auto">
        <div className="bs-card">
          <h2 className="text-center">Buy tokens</h2>
          <button className="btn" onClick={handleClick}>Add tokens</button>
        </div>
      </div>
    </div>
  )
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
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