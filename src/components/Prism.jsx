import React from 'react';
import { Route } from 'react-router-dom';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';

import query from 'queries/channel.gql';

// import withChannel from './withChannel';

const ChannelView = ({ match: { params }, staticContext }) => {
  if (staticContext) Object.assign(staticContext, params);
  return (<h3>{params.view}</h3>);
};

class Channel extends React.PureComponent {
  // componentWillReceiveProps(Props) {}
  render() {
    const { match: { params }, staticContext, data } = this.props;

    if (staticContext) Object.assign(staticContext, params);

    return (<section className="nexus">
      <header>
        <h1><span>/</span>{params.channel}</h1>
      </header>
      <Route path="/:channel/:view" component={ChannelView} />
      <footer>
        <h5>{data.me ? data.me.handle : null}</h5>
      </footer>
      <Helmet>
        <title>{params.channel}</title>
      </Helmet>
    </section>);
  }
}

const Prism = graphql(query, {
  alias: 'Prism',
  options: ({ match: { params }, limit, kinds }) => ({
    variables: {
      limit,
      kinds,
      id: params.channel,
    },
  }),
})(Channel);

export default Prism;
