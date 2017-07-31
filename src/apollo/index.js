import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

export default function createClient({ uri }) {
  const subscriptionInterface = new SubscriptionClient(uri, {
    lazy: true,
    reconnect: true,
    connectionCallback: error => console.log(error),
  });

  const networkInterface = createNetworkInterface({
    uri,
    opts: {
      credentials: 'same-origin',
    },
  });

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) req.options.headers = {};
      const token = localStorage.getItem('session.token');
      req.options.headers.Authorization = token ? `JWT ${token}` : null;
      next();
    },
  }]);

  return new ApolloClient({
    dataIdFromObject: o => o.id,
    networkInterface: addGraphQLSubscriptions(networkInterface, subscriptionInterface),
    connectToDevTools: process.env.NODE_ENV !== 'production',
  });
}
