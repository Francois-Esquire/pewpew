import React from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';

import query from 'queries/me.gql';

import changeEmailMutation from 'mutations/changeEmail.gql';
import changeHandleMutation from 'mutations/changeHandle.gql';
import changeAvatarMutation from 'mutations/changeAvatar.gql';
import changePasswordMutation from 'mutations/changePassword.gql';
import deleteAccountMutation from 'mutations/deleteAccount.gql';

export default function withMe(Component, {
  Loading = () => <p>Loading</p>,
  ErrorHandler = ({ error }) => <p>{error.message}</p>,
}) {
  const AllAboutMe = ({
    data,
    changeEmail,
    changeHandle,
    changeAvatar,
    changePassword,
    deleteAccount,
  }) => {
    const { loading, error, me } = data || {};

    if (error) return <ErrorHandler error={error} />;
    else if (loading) return <Loading />;

    return (<Component
      me={me}
      changeEmail={changeEmail}
      changeHandle={changeHandle}
      changeAvatar={changeAvatar}
      changePassword={changePassword}
      deleteAccount={deleteAccount} />);
  };

  AllAboutMe.propTypes = {
    changeEmail: PropTypes.func,
    changeHandle: PropTypes.func,
    changeAvatar: PropTypes.func,
    changePassword: PropTypes.func,
    deleteAccount: PropTypes.func,
  };

  return compose(
    graphql(query, {
      alias: 'withMe',
      options: () => ({
        variables: {
          withChannels: true,
          withMoments: true,
        },
      }),
    }),
    graphql(changeEmailMutation, {
      alias: 'changeEmail',
      props: ({ ownProps: { data }, mutate }) => ({
        data,
        changeEmail(email) {
          return mutate({
            variables: { email },
            optimisticResponse: {
              __typename: 'Mutation',
              changeEmail: true,
            },
            update(proxy, { data: { changeEmail } }) {
              if (changeEmail) {
                const variables = data.variables;
                const dataProxy = proxy.readQuery({ query, variables });

                Object.assign(dataProxy.me, { email });

                proxy.writeQuery({ query, data: dataProxy, variables });
              }
            },
          });
        },
      }),
    }),
    graphql(changeHandleMutation, {
      alias: 'changeHandle',
      props: ({ ownProps: { data, changeEmail }, mutate }) => ({
        data,
        changeEmail,
        changeHandle(handle) {
          return mutate({
            variables: { handle },
            optimisticResponse: {
              __typename: 'Mutation',
              changeHandle: true,
            },
            update(proxy, { data: { changeHandle } }) {
              if (changeHandle) {
                const variables = data.variables;
                const dataProxy = proxy.readQuery({ query, variables });

                Object.assign(dataProxy.me, { handle });

                proxy.writeQuery({ query, data: dataProxy, variables });
              }
            },
          });
        },
      }),
    }),
    graphql(changeAvatarMutation, {
      alias: 'changeAvatar',
      props: ({ ownProps: { data, changeEmail, changeHandle }, mutate }) => ({
        data,
        changeEmail,
        changeHandle,
        changeAvatar(avatar) {
          return mutate({
            variables: { avatar },
            optimisticResponse: {
              __typename: 'Mutation',
              changeAvatar: true,
            },
            update(proxy, { data: { changeAvatar } }) {
              if (changeAvatar) {
                const variables = data.variables;
                const dataProxy = proxy.readQuery({ query, variables });

                Object.assign(dataProxy.me, { avatar });

                proxy.writeQuery({ query, data: dataProxy, variables });
              }
            },
          });
        },
      }),
    }),
    graphql(changePasswordMutation, {
      alias: 'changePassword',
      props: ({ ownProps: { data, changeEmail, changeHandle, changeAvatar }, mutate }) => ({
        data,
        changeEmail,
        changeHandle,
        changeAvatar,
        changePassword(pass, word) {
          return mutate({
            variables: { pass, word },
            optimisticResponse: {
              __typename: 'Mutation',
              changePassword: true,
            },
          });
        },
      }),
    }),
    graphql(deleteAccountMutation, {
      alias: 'deleteAccount',
      props: ({ ownProps, mutate }) => ({
        ...ownProps,
        changeHandle(handle) {
          return mutate({
            variables: { handle },
            optimisticResponse: {
              __typename: 'Mutation',
              deleteAccount: true,
            },
            update(proxy, { data: { deleteAccount } }) {
              if (deleteAccount) {
                const variables = ownProps.data.variables;
                const dataProxy = proxy.readQuery({ query, variables });

                dataProxy.me = null;

                proxy.writeQuery({ query, data: dataProxy, variables });
              }
            },
          });
        },
      }),
    }))(AllAboutMe);
}
