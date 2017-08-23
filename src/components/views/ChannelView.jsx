import React from 'react';
import { graphql } from 'react-apollo';

import queryChannels from 'queries/channels.gql';

const ChannelSection = ({ data: { channels }, filter }) => (<section className="home-channels">
  <header>
    <h3>Channels</h3>
  </header>
  {channels.filter(filter || (() => true)).map(c => (<p>{c.id}</p>))}
</section>);

const ChannelsView = graphql(queryChannels)(ChannelSection);

export default ChannelsView;
