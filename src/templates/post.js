import React from 'react'
import { graphql, Link } from 'gatsby'
import { RichText } from 'prismic-reactjs'
import Layout from '../components/layouts' 
import { ImageCaption, Quote, Text } from '../components/slices'
import { Disqus, CommentCount } from 'gatsby-plugin-disqus'

// Query for the Blog Post content in Prismic
export const query = graphql`
query BlogPostQuery($uid: String) {
  site {
    siteMetadata {
      siteUrl
    }
  }
  prismic{
    allPosts(uid: $uid){
      edges{
        node{
          _meta{
            id
            uid
            type
          }
          title
          date
          body{
            __typename
            ... on PRISMIC_PostBodyText{
              type
              label
              primary{
                text
              }
            }
            ... on PRISMIC_PostBodyQuote{
              type
              label
              primary{
                quote
              }
            }
            ... on PRISMIC_PostBodyImage_with_caption{
              type
              label
              primary{
                image
                caption
              }
            }
          }
        }
      }
    }
  }
}
`

// Sort and display the different slice options
const PostSlices = ({ slices }) => {
  return slices.map((slice, index) => {
    const res = (() => {
      switch(slice.type) {
        case 'text': return (
          <div key={ index } className="homepage-slice-wrapper">
            { <Text slice={ slice } /> }
          </div>
        )

        case 'quote': return (
          <div key={ index } className="homepage-slice-wrapper">
            { <Quote slice={ slice } /> }
          </div>
        )

        case 'image_with_caption': return (
          <div key={ index } className="homepage-slice-wrapper">
            { <ImageCaption slice={ slice } /> }
          </div>
        )

        default: return
      }
    })();
    return res;
  })
}

// Display the title, date, and content of the Post
const PostBody = ({ blogPost, siteUrl, pathname }) => {
  const titled = blogPost.title.length !== 0 ;
  const title = titled ? RichText.asText(blogPost.title) : 'Untitled';

  const disqusConfig = {
    url: `${siteUrl + pathname}`,
    identifier: blogPost._meta.id,
    title: title,
  }

  return (
    <div>
      <div className="container post-header">
        <div className="back">
          <Link to="/">back to list</Link>
        </div>
        {/* Render the edit button */}
        <h1 data-wio-id={ blogPost._meta.id }>
          {title}
        </h1>
      </div>
      {/* Go through the slices of the post and render the appropiate one */}
      <PostSlices slices={ blogPost.body } />
      <div className="container">
        <Disqus config={disqusConfig} />
      </div>
    </div>
  );
}

export default (props) => {
  // Define the Post content returned from Prismic
  const doc = props.data.prismic.allPosts.edges.slice(0,1).pop();
  const siteUrl = props.data.site.siteMetadata.siteUrl;
  const pathname = props.location.pathname

  if(!doc) return null;

  return(
    <Layout>
      <PostBody blogPost={ doc.node } siteUrl={siteUrl} pathname={pathname} />
    </Layout>
  )
}
