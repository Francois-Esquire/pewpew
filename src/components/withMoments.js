import React from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';

import queryMe from 'queries/me.gql';
import queryMoments from 'queries/moments.gql';
import subscription from 'subscriptions/moments.gql';

import rememberMomentMutation from 'mutations/remember.gql';
import reliveMomentMutation from 'mutations/relive.gql';
import reactToMomentMutation from 'mutations/react.gql';
import forgetMomentMutation from 'mutations/forget.gql';

export default function withMoments(Component, {
  Loading = () => <p>Loading</p>,
  ErrorHandler = ({ error }) => <p>{error.message}</p>,
}) {
  class Momentum extends React.PureComponent {
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

      if (channel.id !== this.props.channel.id) {
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
        variables,
        document: subscription,
        updateQuery: (prev, { subscriptionData: { data } }) => {
          const { moments: { action, payload } } = data;

          switch (action) {
            default: return prev;
          }
        },
        onError: error => this.setState(state => ({ errors: state.errors.concat(error) })),
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
      const { data, remember, relive, react, forget } = this.props;
      const { loading, error, moments, me } = data || {};

      if (error) return <ErrorHandler error={error} />;
      else if (loading) return <Loading />;

      return (<Component
        me={me}
        moments={moments}
        remember={remember}
        relive={relive}
        react={react}
        forget={forget} />);
    }
  }

  Momentum.propTypes = {
    remember: PropTypes.func,
    relive: PropTypes.func,
    react: PropTypes.func,
    forget: PropTypes.func,
  };

  return compose(
    graphql(queryMe, { alias: 'withMe' }),
    graphql(queryMoments, {
      alias: 'withMoments',
      skip: ({ momentum = true }) => momentum,
      options: ({ channel, limit }) => ({
        variables: { channel: channel.id, limit },
      }),
    }),
    graphql(rememberMomentMutation, {
      alias: 'remember',
      props: ({ ownProps: { data, channel }, mutate }) => ({
        data,
        channel,
        remember(content, kind) {
          return mutate({
            variables: { channel: channel.id, content, kind },
            optimisticResponse: {
              __typename: 'Mutation',
              remember: {
                __typename: 'Moment',
                id: '13',
                channel: channel.id,
                by: data.me.id,
                content,
                kind,
              },
            },
            update(proxy, { data: { remember } }) {
              const query = queryMoments;
              const variables = data.variables;
              const dataProxy = proxy.readQuery({ query, variables });

              dataProxy.moments.push(remember);

              proxy.writeQuery({ query, data: dataProxy, variables });
            },
          });
        },
      }),
    }),
    graphql(reliveMomentMutation, {
      alias: 'relive',
      props: ({ ownProps: { channel, data, remember }, mutate }) => ({
        data,
        channel,
        remember,
        relive(id, content, kind) {
          return mutate({
            variables: { id, content, kind },
            optimisticResponse: {
              __typename: 'Mutation',
              relive: {
                __typename: 'Moment',
                channel: channel.id,
                by: data.me.id,
                id,
                content,
                kind,
              },
            },
          });
        },
      }),
    }),
    graphql(reactToMomentMutation, {
      alias: 'react',
      props: ({ ownProps: { channel, data, remember, relive }, mutate }) => ({
        data,
        channel,
        remember,
        relive,
        react(id, content, kind) {
          return mutate({
            variables: { id, content, kind },
            optimisticResponse: {
              __typename: 'Mutation',
              react: {
                __typename: 'Moment',
                channel: channel.id,
                id: '24',
                by: data.me.id,
                content,
                kind,
              },
            },
          });
        },
      }),
    }),
    graphql(forgetMomentMutation, {
      alias: 'forget',
      props: ({
        ownProps: {
          channel, data, remember, relive, react,
        }, mutate,
      }) => ({
        data,
        channel,
        remember,
        relive,
        react,
        forget(id) {
          return mutate({
            variables: { id },
            optimisticResponse: { __typename: 'Mutation', forget: true },
          });
        },
      }),
    }))(Momentum);
}
