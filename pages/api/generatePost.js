import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { Configuration, OpenAIApi } from 'openai';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res)
  const client = await clientPromise;
  const db = client.db("BlogStandard")
  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub
  })

  if (!userProfile.availableTokens) {
    res.status(403);
    return;
  }

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const openai = new OpenAIApi(config);

  const { topic, keywords } = req.body

  if (!topic.trim() || !keywords.trim()) {
    return res.status(422);
  }

  if (topic.length > 80 || keywords.length > 80) {
    return res.status(422);
  }

  try {
    const tags = "h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i"

    const postContentResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are a blog post generator'
        },
        {
          role: "user",
          content: `
            Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following coma separated keywords: ${keywords}.
            The content should be formatted in SEO-friendly HTML, limited to the following HTML tags: ${tags}.
          `
        },
      ]
    })

    const postContent = postContentResponse.data.choices[0]?.message?.content || '';

    const titleResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are a blog post generator'
        },
        {
          role: "user",
          content: `
            Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following coma separated keywords: ${keywords}.
            The content should be formatted in SEO-friendly HTML, limited to the following HTML tags: ${tags}.
          `
        },
        {
          role: "assistant",
          content: postContent
        },
        {
          role: "user",
          content: "Generate appropriate title text for the above blog post"
        }
      ]
    })

    const metaDescriptionResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are a blog post generator'
        },
        {
          role: "user",
          content: `
            Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following coma separated keywords: ${keywords}.
            The content should be formatted in SEO-friendly HTML, limited to the following HTML tags: ${tags}.
          `
        },
        {
          role: "assistant",
          content: postContent
        },
        {
          role: "user",
          content: "Generate SEO-friendly meta description content for the above blog post"
        }
      ]
    })

    const title = titleResponse.data.choices[0]?.message?.content || '';
    const metaDescription = metaDescriptionResponse.data.choices[0]?.message?.content || '';

    await db.collection("users").updateOne({
      auth0Id: user.sub
    }, {
      $inc: {
        availableTokens: -1
      }
    })

    const post = await db.collection("posts").insertOne({
      postContent,
      title,
      metaDescription,
      topic,
      keywords,
      userId: userProfile._id,
      created: new Date()
    })

    return res.status(200).json({ postId: post.insertedId })

  } catch (e) {
    console.error(e)
    return res.json({ e })
  }
})
