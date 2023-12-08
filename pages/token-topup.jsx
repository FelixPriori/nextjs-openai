import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { getAppProps } from "../utils/getAppProps";
import AppLayout from "../components/AppLayout/AppLayout";

export default function TokenTopup() {
  const handleClick = async () => {
    await fetch('/api/addTokens', {
      method: "POST",
    })
  }

  return (
    <div>
      <div>This is the token topup page</div>
      <button className="btn" onClick={handleClick}>Add tokens</button>
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