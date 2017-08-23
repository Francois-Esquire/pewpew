import React from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';

import queryMe from 'queries/me.gql';
import queryChannel from 'queries/channel.gql';
import subscription from 'subscriptions/channel.gql';

import publishChannelMutation from 'mutations/publishChannel.gql';
import updateChannelMutation from 'mutations/updateChannel.gql';
import joinChannelMutation from 'mutations/joinChannel.gql';
import abandonChannelMutation from 'mutations/abandonChannel.gql';

export default function withChannel(Component, {
  Loading = () => <p>Loading</p>,
  ErrorHandler = ({ error }) => <p>{error.message}</p>,
}) {
  class Broadcast extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        errors: [],
      };

      this.subscription = null;

      this.subscribe = this.subscribe.bind(this);
      this.unsubscribe = this.unsubscribe.bind(this);
    }
    componentDidMount() {
      this.subscribe();
    }
    componentWillReceiveProps(Props) {
      const { channel } = Props;

      if (channel.id !== this.props.channel.id || channel.url !== this.props.channel.url) {
        if (this.subscription) this.unsubscribe();
        else this.subscribe();
      } else if (this.subscription === null) this.subscribe();
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    subscribe() {
      const { data: { subscribeToMore, variables } } = this.props;

      this.subscription = subscribeToMore({
        document: subscription,
        variables,
        onError: error => this.setState(state => ({ errors: state.errors.concat(error) })),
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const { broadcast: { action, payload } } = data;

          switch (action) {
            default: return prev;
          }
        },
      });
    }
    unsubscribe() {
      if (this.subscription) {
        if ('unsubscribe' in this.subscription) this.subscription.unsubscribe();
        else if (typeof this.subscription === 'function') this.subscription();
        this.subscription = null;
      }
    }
    render() {
      const { data, publish, update, join, abandon } = this.props;
      const { loading, error, channel, me } = data || {};

      if (error) return <ErrorHandler error={error} />;
      else if (loading) return <Loading />;

      return (<Component
        me={me}
        channel={channel}
        publish={publish}
        update={update}
        join={join}
        abandon={abandon} />);
    }
  }

  Broadcast.propTypes = {
    publish: PropTypes.func,
    update: PropTypes.func,
    join: PropTypes.func,
    abandon: PropTypes.func,
  };

  return compose(
    graphql(queryMe, { alias: 'withMe' }),
    graphql(queryChannel, {
      alias: 'withChannel',
      options: ({ channel, limit, momentum = true }) => ({
        variables: { id: channel.id, url: channel.url, limit, momentum },
      }),
    }),
    graphql(publishChannelMutation, {
      alias: 'publishChannel',
      props: ({ ownProps: { data }, mutate }) => ({
        data,
        publish(url, title, description, tags) {
          return mutate({
            variables: { url, title, description, tags },
            optimisticResponse: {
              __typename: 'Mutation',
              publishChannel: {
                __typename: 'Channel',
                id: '13',
                by: data.me.id,
                url,
                title,
                description,
                tags,
              },
            },
            update(proxy, { data: { remember } }) {
              const query = queryChannel;
              const variables = data.variables;
              const dataProxy = proxy.readQuery({ query, variables });

              dataProxy.channel.moments.push(remember);

              proxy.writeQuery({ query, data: dataProxy, variables });
            },
          });
        },
      }),
    }),
    graphql(updateChannelMutation, {
      alias: 'updateChannel',
      props: ({ ownProps: { data, publish }, mutate }) => ({
        data,
        publish,
        update(id) {
          return mutate({
            variables: { id },
            optimisticResponse: {
              __typename: 'Mutation',
              updateChannel: true,
            },
          });
        },
      }),
    }),
    graphql(joinChannelMutation, {
      alias: 'joinChannel',
      props: ({ ownProps: { data, publish, update }, mutate }) => ({
        data,
        publish,
        update,
        join(id) {
          return mutate({
            variables: { id },
            optimisticResponse: {
              __typename: 'Mutation',
              joinChannel: true,
            },
          });
        },
      }),
    }),
    graphql(abandonChannelMutation, {
      alias: 'abandonChannel',
      props: ({
        ownProps: {
          data, publish, update, join,
        }, mutate,
      }) => ({
        data,
        publish,
        update,
        join,
        abandon(id) {
          return mutate({
            variables: { id },
            optimisticResponse: {
              __typename: 'Mutation',
              abandonChannel: true,
            },
          });
        },
      }),
    }))(Broadcast);
}
