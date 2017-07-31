import React from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';

import query from '../../schema/queries/moments.gql';
import subscription from '../../schema/subscriptions/channel.gql';

import sendMessageMutation from '../../schema/mutations/message_send';
import editMessageMutation from '../../schema/mutations/message_edit';
import eraseMessageMutation from '../../schema/mutations/message_erase';
import isTypingMutation from '../../schema/mutations/message_is_typing';

export default function withChannel(Component) {
  class Messenger extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        errors: []
      };

      this.subscription = null;

      this.subscribe = this.subscribe.bind(this);
      this.unsubscribe = this.unsubscribe.bind(this);
    }
    componentWillMount() {
      if (this.props.data.loading || this.props.data.error) return;
      this.subscribe();
    }
    componentWillReceiveProps(Props) {
      const { loading, error, messages } = Props.data;
      if (loading || error) return;
      if (Props.thread.id !== this.props.thread.id || (messages && !loading && !error && !this.subscription)) {
        if (this.subscription) this.unsubscribe();
        this.subscribe();
      }
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    subscribe() {
      const { data: { subscribeToMore, variables }, me } = this.props;

      this.subscription = subscribeToMore({
        document: subscription,
        variables,
        onError: error => this.setState(state => ({ errors: state.errors.concat(error) })),
        updateQuery: (prev, { subscriptionData }) => {
          const { messenger: { action, payload } } = subscriptionData.data, messages = prev.messages;

          if (payload.by === me.id) return prev;

          switch(action) {
            default: return prev;
            case 'create': return { ...prev, messages: ([...messages]).concat(payload) };
            case 'edit': return { ...prev, messages: messages.reduce((a, b) => a.concat( b.id === payload.id ? { ...b, ...payload } : b ), []) };
            case 'erase': return { ...prev, messages: [...messages.filter(m => m.id !== payload.id)] };
            case 'isTyping': return prev;
          }
        }
      });
    }
    unsubscribe() {
      this.subscription && 'unsubscribe' in this.subscription ?
        this.subscription.unsubscribe() : typeof this.subscription == 'function' &&
          this.subscription();
      this.subscription = null;
    }
    render() {
      const { me, thread, data, sendMessage, editMessage, eraseMessage, isTyping } = this.props;
      const { loading, error, messages } = data || {};

      return error ? <p>{error.message}</p> : loading ? <div /> : messages ? (
        <Component
          me={me}
          thread={thread}
          messages={messages}
          data={data}
          sendMessage={sendMessage}
          editMessage={editMessage}
          eraseMessage={eraseMessage}
          isTyping={isTyping}
        />
      ): null;
    }
  }

  Messenger.propTypes = {
    me: PropTypes.object.isRequired,
    thread: PropTypes.object.isRequired,
    data: PropTypes.object,
    sendMessage: PropTypes.func,
    editMessage: PropTypes.func,
    eraseMessage: PropTypes.func,
    isTyping: PropTypes.func
  };

  const withMoments = compose(
    graphql(sendMessageMutation, {
      alias: 'sendessage',
      props: ({ ownProps: { me, thread, data:{messages} }, mutate }) => ({
        me, thread, messages, sendMessage(content) {
          return mutate({
            variables: { thread: thread.id, content },
            optimisticResponse: {
              __typename: 'Mutation',
              sendMessage: {
                __typename: 'Message', id: -1, by: me.id, thread: thread.id,
                content, edited: [], createdAt: Date.now()
              }
            },
            update(proxy, { data: { sendMessage } }) {
              const variables = { thread: thread.id }, data = proxy.readQuery({ query, variables });
              data.messages.push(sendMessage);
              proxy.writeQuery({ query, data, variables });
            }
          });
        }
      })
    }),
    graphql(editMessageMutation, {
      alias: 'editMessage',
      props: ({ ownProps: { me, thread, data:{messages}, sendMessage }, mutate }) => ({
        me, thread, messages, sendMessage, editMessage(id, content) {
          const msg = messages.find(msg => msg.id === id);
          msg.edited.push(Date.now());
          return mutate({
            variables: { id, content },
            optimisticResponse: { __typename: 'Mutation', editMessage: { ...msg, content } }
          });
        }
      })
    }),
    graphql(eraseMessageMutation, {
      alias: 'eraseMessage',
      props: ({ ownProps: { me, thread, data:{messages}, sendMessage, editMessage }, mutate }) => ({
        me, thread, messages, sendMessage, editMessage, eraseMessage(id) {
          const i = messages.findIndex(msg => msg.id === id);
          return mutate({
            variables: { id },
            optimisticResponse: { __typename: 'Mutation', eraseMessage: { ...messages[i] } },
            update(proxy, { data: { eraseMessage } }) {
              const variables = { thread: thread.id }, data = proxy.readQuery({ query, variables });
              data.messages = data.messages.splice(i, 1);
              proxy.writeQuery({ query, data, variables });
            }
          });
        }
      })
    }),
    graphql(isTypingMutation, {
      alias: 'isTyping',
      props: ({ ownProps: { me, thread, data:{messages}, sendMessage, editMessage, eraseMessage }, mutate }) => ({
        me, thread, messages, sendMessage, editMessage, eraseMessage, isTyping(active) {
          const i = messages.findIndex(msg => msg.id === id);
          return mutate({
            variables: { thread: thread.id, active },
            optimisticResponse: { __typename: 'Mutation', isTyping: { status: active } }
          });
        }
      })
    })
  )(Messenger);

  withMoments.propTypes = {
    me: PropTypes.object.isRequired,
    thread: PropTypes.object.isRequired,
    data: PropTypes.object
  };

  return graphql(query, {
    alias: 'withMoments',
    skip: props => !props.thread || !props.me,
    options: ({ thread }) => ({
      variables: { thread: thread.id }
    })
  })(withMoments);
};
