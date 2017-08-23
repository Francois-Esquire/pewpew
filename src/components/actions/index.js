import React from 'react';
import { graphql } from 'react-apollo';

import query from 'queries/me.gql';
import logoutMutation from 'mutations/logout.gql';
import verifyEmailMutation from 'mutations/verifyEmail.gql';
import sendVerificationMutation from 'mutations/sendVerification.gql';
import recoverAccountMutation from 'mutations/recoverAccount.gql';
import sendRecoveryMutation from 'mutations/sendRecovery.gql';

export const ActionButton = ({ children, onClick }) => (<button
  type="button"
  onClick={onClick}>{
    children
  }</button>);

const props = ({ ownProps, mutate, p: {
  onSuccess = () => undefined,
  onFailure = () => undefined,
} = ownProps }) => {
  const newProps = Object.assign({}, ownProps, {
    onClick: () => {
      return mutate()
        .then(onSuccess)
        .catch(onFailure);
    },
  });

  return newProps;
};

export const logOut = graphql(logoutMutation, {
  alias: 'logout',
  props,
  options: ({ session }) => ({
    variables: { session },
    optimisticResponse: {
      __typename: 'Mutation',
      logout: true,
    },
    update: (proxy, { data: { logout } }) => {
      if (logout) {
        const data = proxy.readQuery({ query });
        data.me = null;
        proxy.writeQuery({ query, data });
      }
    },
  }),
});

export const verifyEmail = graphql(verifyEmailMutation, {
  alias: 'verifyEmail',
  props,
  options: ({ email, token }) => ({
    variables: { email, token },
    optimisticResponse: {
      __typename: 'Mutation',
      verifyEmail: true,
    },
  }),
});

export const sendVerification = graphql(sendVerificationMutation, {
  alias: 'sendVerification',
  props,
  options: ({ email }) => ({
    variables: { email },
    optimisticResponse: {
      __typename: 'Mutation',
      sendVerification: true,
    },
  }),
});

export const sendRecovery = graphql(sendRecoveryMutation, {
  alias: 'sendRecovery',
  props,
  options: ({ email, handle }) => ({
    variables: { email, handle },
    optimisticResponse: {
      __typename: 'Mutation',
      sendRecovery: true,
    },
  }),
});

export const recoverAccount = graphql(recoverAccountMutation, {
  alias: 'recoverAccount',
  props,
  options: ({ token, pass, word }) => ({
    variables: { token, pass, word },
    optimisticResponse: {
      __typename: 'Mutation',
      recoverAccount: true,
    },
  }),
});
