import React from 'react';

const Moment = ({ id, by, content, kind }) => (<article>
  <header>{by}</header>
  <p>{id}</p>
  <p>{kind}</p>
  <p>{content}</p>
</article>);

// const Moments = graphql(queryMoments, {
//   alias: 'withMoments',
//   options: ({ channel, limit }) => ({
//     variables: { channel, limit },
//   }),
// })(({ data: { error, loading, moments } }) => {
//   if (error) return (<p>{error}</p>);
//   else if (loading) return (<p>{loading}</p>);
//
//   return (<ul>{moments.map(moment => (<li key={moment.id}>
//     <Moment moment={moment} />
//   </li>))}</ul>);
// });
export default Moment;
