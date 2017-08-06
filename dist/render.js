'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var ReactDOMServer = _interopDefault(require('react-dom/server'));
var reactRouterDom = require('react-router-dom');
var reactApollo = require('react-apollo');
var Helmet = _interopDefault(require('react-helmet'));
var redux = require('redux');
var ReactModal = _interopDefault(require('react-modal'));
var reactRedux = require('react-redux');
var PropTypes = _interopDefault(require('prop-types'));
var anime = _interopDefault(require('animejs'));

const defaults = {
  isOpen: false,
  view: null,
  label: 'modal',
  role: 'dialog',
  delay: 0,
  onOpen: function () { return null; },
  onClose: function (cb) { return cb(); },
  styleNames: {
    className: 'ReactModal__Content',
    portalClassName: 'ReactModalPortal',
    overlayClassName: 'ReactModal__Overlay',
    bodyOpenClassName: 'ReactModal__Body--open',
  },
  style: ReactModal.defaultStyles,
};
function modal(state, action) {
  if ( state === void 0 ) state = defaults;
  if (/@@modal/.test(action.type)) {
    var type = action.type;
    var view = action.view; if ( view === void 0 ) view = defaults.view;
    var label = action.label; if ( label === void 0 ) label = defaults.label;
    var role = action.role; if ( role === void 0 ) role = defaults.role;
    var delay = action.delay; if ( delay === void 0 ) delay = defaults.delay;
    var onOpen = action.onOpen; if ( onOpen === void 0 ) onOpen = defaults.onOpen;
    var onClose = action.onClose; if ( onClose === void 0 ) onClose = defaults.onClose;
    var styleNames = action.styleNames; if ( styleNames === void 0 ) styleNames = {};
    var style = action.style; if ( style === void 0 ) style = {};
    if (type === '@@modal/close') { return Object.assign({}, state,
      {isOpen: false}); }
    return Object.assign({}, state,
      {view: view,
      label: label,
      role: role,
      delay: delay,
      onOpen: onOpen,
      onClose: onClose,
      isOpen: type === '@@modal/open' ? !!view : type === '@@modal/close' && false,
      styleNames: Object.assign({}, defaults.styleNames,
        styleNames),
      style: Object.assign({}, defaults.style,
        style)});
  } return state;
}

function channel(state, action) {
  if ( state === void 0 ) state = {
  url: '',
};
  if (/^@@channel/.test(action.type)) {
    var url = action.url;
    return { url: url };
  }
  return state;
}

var rootReducers = {
  modal: modal,
  channel: channel,
};

function configureStore(
  state,
  reducers,
  middleware) {
  if ( reducers === void 0 ) reducers = {};
  if ( middleware === void 0 ) middleware = [];
  const initialState = state || undefined;
  const rootReducer = redux.combineReducers(Object.assign({}, reducers, rootReducers));
  const enhancers = [redux.applyMiddleware.apply(void 0, middleware)];
  {
    const enhancements = (
      typeof window === 'object' &&
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : redux.compose
    ).apply(void 0, enhancers);
    const store = redux.createStore(rootReducer, initialState, enhancements);
    if (module && module.hot) {
      module.hot.accept('./reducers', function () {
        const nextReducers = require('./reducers').default;
        store.replaceReducer(redux.combineReducers(Object.assign({}, reducers,
          nextReducers)));
      });
    }
    return store;
  }
  return redux.createStore(rootReducer, initialState, redux.compose.apply(void 0, enhancers));
}

var doc = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Moi"},"variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"me"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"email"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"handle"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"avatar"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channels"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"moments"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}]}}],"loc":{"start":0,"end":123}};
    doc.loc.source = {"body":"query Moi {\n  me {\n    id\n    email\n    handle\n    avatar\n    channels {\n      id\n    }\n    moments {\n      id\n    }\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const MainMenu = function (ref) {
  var children = ref.children;
  var channel = ref.channel;
  var modal = ref.modal;
  return (
  React.createElement( 'nav', { className: "main-menu" },
    React.createElement( 'header', null,
      React.createElement( 'button', { type: "button", onClick: function () { return modal.onClose(modal.close); } }, "Close")
    ),
    children,
    React.createElement( reactRouterDom.NavLink, { exact: true, to: "/", className: "home", activeClassName: "jackpot" },
      React.createElement( 'span', null, "Home" )
    ),
    React.createElement( 'footer', null,
      React.createElement( 'h5', null, channel )
    )
  ));
};
MainMenu.propTypes = {
  children: PropTypes.node,
};
MainMenu.defaultProps = {
  children: null,
};
MainMenu.contextTypes = {
  modal: PropTypes.object,
};

function Nav(ref, ref$1) {
  var data = ref.data;
  var channel = ref.channel;
  var modal = ref$1.modal;
  return (React.createElement( 'header', null,
    React.createElement( 'button', { onClick: function () { return modal.open(function (modalProps) { return (React.createElement( MainMenu, Object.assign({}, { channel: channel }, modalProps))); }, {
      label: 'Main Menu',
      role: 'menu',
      delay: 2800,
      onOpen: function () { return anime({
        targets: Object.keys(modal.style).map(function (key) { return modal.style[key]; }),
        opacity: 1,
        easing: 'easeInOutExpo',
        duration: 800,
        complete: function () {
          console.log('opening completed!');
        },
      }); },
      styleNames: {
        className: 'Main_Menu_Content',
        portalClassName: 'ReactModalPortal Main_Menu',
        overlayClassName: 'Main_Menu_Overlay',
      },
    }); } }, "Menu"),
    React.createElement( 'span', null, data.me ? 'Moi' : channel )
  ));
}
Nav.propTypes = {
  channel: PropTypes.string,
};
Nav.defaultProps = {
  channel: '',
};
Nav.contextTypes = {
  modal: PropTypes.object,
};
const Header = reactApollo.graphql(doc)(Nav);

var Hub = (function (superclass) {
  function Hub () {
    superclass.apply(this, arguments);
  }
  if ( superclass ) Hub.__proto__ = superclass;
  Hub.prototype = Object.create( superclass && superclass.prototype );
  Hub.prototype.constructor = Hub;
  Hub.prototype.render = function () {
    var ref = this.props;
    var channel = ref.channel;
    var location = ref.location;
    var history = ref.history;
    var data = ref.data;
    return (React.createElement( 'section', { className: "nexus" },
      React.createElement( 'header', null,
        React.createElement( 'img', { width: "50%", src: "/images/pewpew.svg", alt: "Pew Pew" }),
        React.createElement( 'h1', null, React.createElement( 'span', null, "/" ), channel )
      )
                                      ,
      React.createElement( Helmet, null,
        React.createElement( 'title', null, channel )
      )
    ));
  };
  return Hub;
}(React.PureComponent));
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
const Nexus = reactApollo.graphql(doc)(Hub);

var Application$1 = (function (superclass) {
  function Application () {
    superclass.apply(this, arguments);
  }
  if ( superclass ) Application.__proto__ = superclass;
  Application.prototype = Object.create( superclass && superclass.prototype );
  Application.prototype.constructor = Application;
  Application.prototype.getChildContext = function () {
    var ref = this.props;
    var modal = ref.modal;
    return {
      modal: modal,
    };
  };
  Application.prototype.componentWillReceiveProps = function (Props) {
    var modal = Props.modal;
    var location = Props.location;
    if (modal.isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    if (location.pathname !== this.props.location.pathname) {
      if (modal.view) { modal.close(); }
    }
  };
  Application.prototype.render = function () {
    var ref = this.props;
    var appElement = ref.appElement;
    var isServer = ref.isServer;
    var match = ref.match;
    var location = ref.location;
    var history = ref.history;
    var modal = ref.modal;
    var channel = ref.channel;
    // eslint-disable-next-line no-confusing-arrow
    const Modal = function () { return modal.isOpen && modal.view ?
      (React.createElement( modal.view, { modal: modal, match: match, location: location, history: history })) : null; };
    return (React.createElement( 'main', { id: "view" },
      React.createElement( Header, { channel: channel.url, openMenu: this.openMenu }),
      React.createElement( reactRouterDom.Switch, null,
        React.createElement( reactRouterDom.Route, {
          exact: true, path: "/", render: function () { return (React.createElement( 'section', { className: "home" },
            React.createElement( 'img', { width: "50%", src: "/images/pewpew.svg", alt: "Pew Pew" }),
            React.createElement( 'form', {
              id: "channel", onSubmit: function (event) {
                event.preventDefault();
                return history.push(`/${channel.url}`);
              } },
              React.createElement( 'label', { htmlFor: "remote" }, "/"),
              React.createElement( 'input', {
                id: "remote", type: "text", value: channel.url, placeholder: "Tune in to...", onChange: function (ref) {
                  var value = ref.target.value;
                  return channel.change(value.toLowerCase());
            } }),
              React.createElement( 'button', { type: "submit" }, "Go")
            )
          )); } }),
        React.createElement( reactRouterDom.Route, {
          path: "/:channel", render: function (ref) {
            var params = ref.match.params;
            return (React.createElement( Nexus, { channel: params.channel }));
    } })
      ),
      React.createElement( 'footer', null,
        React.createElement( 'h6', null, React.createElement( 'a', { href: "https://github.com/Francois-Esquire/pewpew" }, "github") )
      ),
      React.createElement( ReactModal, {
        contentLabel: modal.label, role: modal.role, isOpen: modal.isOpen, onAfterOpen: modal.onOpen, onRequestClose: function () { return modal.onClose(modal.close); }, closeTimeoutMS: modal.delay, shouldCloseOnOverlayClick: true, style: modal.style, className: modal.styleNames.className, portalClassName: modal.styleNames.portalClassName, overlayClassName: modal.styleNames.overlayClassName, bodyOpenClassName: modal.styleNames.bodyOpenClassName, appElement: appElement, ariaHideApp: true },
        React.createElement( Modal, null )
      ),
      React.createElement( Helmet, {
        encodeSpecialCharacters: !isServer, titleTemplate: "%s | Pew Pew" },
        React.createElement( 'title', { itemProp: "name", lang: "en" }, "Shoot")
      )
    ));
  };
  return Application;
}(React.Component));
Application$1.propTypes = {
  appElement: function(props, propName, componentName) {
    if (!props.isServer && props[propName] instanceof Element === false) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
    }
    return null;
  },
  isServer: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  match: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object,
};
Application$1.defaultProps = {
  appElement: undefined,
  isServer: false,
  match: {},
  location: {},
  history: {},
  modal: {},
  channel: {},
};
Application$1.childContextTypes = {
  modal: PropTypes.object,
};

const Root = reactApollo.compose(
  reactRouterDom.withRouter,
  reactRedux.connect(
    // eslint-disable-next-line prefer-arrow-callback
    function mapStateToProps(state, ownProps) { return Object.assign({}, state, ownProps); },
    // eslint-disable-next-line prefer-arrow-callback
    function mapDispatchToProps(dispatch) {
      return {
        channel: {
          change: function (url) { return dispatch({ type: '@@channel/change', url: url }); },
        },
        modal: redux.bindActionCreators({
          open: function (view, ref) {
            var label = ref.label;
            var role = ref.role;
            var delay = ref.delay;
            var onOpen = ref.onOpen;
            var onClose = ref.onClose;
            var styleNames = ref.styleNames;
            var style = ref.style;
            return ({
            type: '@@modal/open',
            view: view,
            label: label,
            role: role,
            delay: delay,
            onOpen: onOpen,
            onClose: onClose,
            styleNames: styleNames,
            style: style,
          });
      },
          close: function () { return dispatch({ type: '@@modal/close' }); },
        }, dispatch),
      };
    },
    // eslint-disable-next-line prefer-arrow-callback
    function mergeProps(stateProps, dispatchers) {
      // eslint-disable-next-line no-confusing-arrow
      return Object.keys(dispatchers).reduce(function (props, next) { return props[next] ?
        Object.assign({}, props, { [next]: Object.assign({}, props[next], dispatchers[next]) }) :
        Object.assign({}, props, { [next]: dispatchers[next] }); },
      stateProps);
    }, { pure: true }))(Application$1);

const Html = function (ref) {
  var meta = ref.meta;
  var head = ref.head;
  var html = ref.html;
  var scripts = ref.scripts;
  var window = ref.window;
  var css = ref.css;
  return (
  React.createElement( 'html', { lang: "en" },
    React.createElement( 'head', null,
      React.createElement( 'meta', { charSet: "utf-8" }),
      React.createElement( 'meta', { httpEquiv: "X-UA-Compatible", content: "IE=edge" }),
      React.createElement( 'meta', { httpEquiv: "Content-Language", content: "en" }),
      React.createElement( 'meta', { name: "viewport", content: "width=device-width, initial-scale=1" }),
      head.meta.toComponent(),
      head.title.toComponent(),
      css.map(function (href) { return React.createElement( 'link', { key: href, rel: "stylesheet", href: href }); })
    ),
    React.createElement( 'body', null,
      React.createElement( 'div', {
        id: "app", dangerouslySetInnerHTML: { __html: html } }),
      React.createElement( 'script', {
        dangerouslySetInnerHTML: {
          __html: Object.keys(window).reduce(
            /* eslint-disable */
            function (out, key) { return out += `window.${key}=${JSON.stringify(window[key])};`; }, ''),
            /* eslint-enable */
        } }),
      scripts.map(function (src) { return React.createElement( 'script', { key: src, src: src }); })
    )
  ));
};
Html.propTypes = {
  html: PropTypes.string.isRequired,
  head: PropTypes.shape({
    meta: PropTypes.object,
    title: PropTypes.object,
  }).isRequired,
  window: PropTypes.shape({
    __$__: PropTypes.object,
  }).isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  css: PropTypes.arrayOf(PropTypes.string).isRequired,
  meta: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function render(ctx, ref) {
  var meta = ref.meta; if ( meta === void 0 ) meta = [];
  var css = ref.css; if ( css === void 0 ) css = [];
  var scripts = ref.scripts; if ( scripts === void 0 ) scripts = [];
  var networkInterface = ref.networkInterface;
  if (ctx.state === undefined) { ctx.state = {}; }
  const client = new reactApollo.ApolloClient({
    dataIdFromObject: function (o) { return o.id; },
    networkInterface: networkInterface,
    ssrMode: true,
  });
  const store = configureStore(false, {
    apollo: client.reducer(),
  }, [client.middleware()]);
  const app = (React.createElement( reactRouterDom.StaticRouter, { location: ctx.path, context: ctx.state },
    React.createElement( reactApollo.ApolloProvider, { client: client, store: store },
      React.createElement( Root, { isServer: true })
    )
  ));
  return new Promise(function (resolve, reject) {
    reactApollo.getDataFromTree(app).then(function () {
      const html = ReactDOMServer.renderToString(app);
      const head = Helmet.rewind();
      if ([301, 302, 404].includes(ctx.state.status)) {
        if (ctx.state.status === 404) { ctx.status = ctx.state.status; }
        else {
          ctx.status = ctx.state.status;
          ctx.redirect(ctx.state.url);
          return resolve();
        }
      }
      const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement( Html, {
          html: html, head: head, meta: meta, css: css, scripts: scripts, window: {
            pewpew: {
              endpoints: {
                graphql: ctx.endpoints.graphql,
              },
            },
            __$__: store.getState(),
          } }));
      ctx.type = 'text/html';
      ctx.body = `<!DOCTYPE html>\n${markup}`;
      return resolve();
    }).catch(reject);
  });
}

module.exports = render;
