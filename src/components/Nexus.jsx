import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import query from '../../schema/queries/me.gql';

// import HandleBar from './forms/HandleBar';

class Hub extends React.PureComponent {
  render() {
    const { channel, location, history, data } = this.props;
    return (<section className="nexus">
      <header>
        <img width="50%" src="/images/pewpew.svg" alt="Pew Pew" />
        <h1><span>/</span>{channel}</h1>
      </header>
      {/* <HandleBar me={data.me} /> */}
      <Helmet>
        <title>{channel}</title>
      </Helmet>
    </section>);
  }
}

Hub.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  channel: PropTypes.string,
};

Hub.defaultProps = {
  location: {},
  history: {},
  channel: '',
};

const Nexus = graphql(query)(Hub);

export default Nexus;
