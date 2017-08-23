import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

export default function createClient({ uri, subUri, params }) {
  const subscriptionInterface = new SubscriptionClient(subUri, {
    lazy: true,
    reconnect: true,
    connectionParams: params,
    connectionCallback: error => console.log(error),
  });

  const networkInterface = createNetworkInterface({
    uri,
    opts: {
      method: 'POST',
      credentials: 'same-origin',
    },
  });

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) req.options.headers = {};
      const token = localStorage.getItem('session.token');
      req.options.headers.Authorization = token ? `Bearer ${token}` : null;
      next();
    },
  }]);

  return new ApolloClient({
    dataIdFromObject: o => o.id,
    networkInterface: addGraphQLSubscriptions(networkInterface, subscriptionInterface),
    connectToDevTools: process.env.NODE_ENV !== 'production',
    queryDeduplication: true,
  });
}
