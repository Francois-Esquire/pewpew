'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var ReactDOMServer = _interopDefault(require('react-dom/server'));
var reactRouterDom = require('react-router-dom');
var reactApollo = require('react-apollo');
var Helmet = _interopDefault(require('react-helmet'));
var redux = require('redux');
var reduxForm = require('redux-form');
var ReactModal = _interopDefault(require('react-modal'));
var reactRedux = require('react-redux');
var PropTypes = _interopDefault(require('prop-types'));
var anime = _interopDefault(require('animejs'));

const MODAL_OPEN = '@@modal/open';
const MODAL_CLOSE = '@@modal/close';
const openModal = function (view, ref) {
  var label = ref.label;
  var role = ref.role;
  var delay = ref.delay;
  var onOpen = ref.onOpen;
  var onClose = ref.onClose;
  var styleNames = ref.styleNames;
  var style = ref.style;
  return ({
  type: MODAL_OPEN,
  view: view,
  label: label,
  role: role,
  delay: delay,
  onOpen: onOpen,
  onClose: onClose,
  styleNames: styleNames,
  style: style,
});
};
const closeModal = function () { return ({ type: MODAL_CLOSE }); };

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
    if (type === MODAL_CLOSE) {
      return Object.assign({}, state,
        {isOpen: false});
    }
    return Object.assign({}, state,
      {view: view,
      label: label,
      role: role,
      delay: delay,
      onOpen: onOpen,
      onClose: onClose,
      isOpen: type === MODAL_OPEN ? !!view : type === '@@modal/close' && false,
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
    return { url: url.replace(/^(\/)/, '').toLowerCase() };
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
  const rootReducer = redux.combineReducers(Object.assign({}, {form: reduxForm.reducer}, reducers, rootReducers));
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
        const nextRootReducer = redux.combineReducers(Object.assign({}, {form: reduxForm.reducer}, reducers, nextReducers));
        store.replaceReducer(nextRootReducer);
      });
    }
    return store;
  }
  return redux.createStore(rootReducer, initialState, redux.compose.apply(void 0, enhancers));
}

const types = {
  Element: function(props, propName, componentName) {
    if (typeof window === 'undefined') { return null; }
    else if (props[propName] instanceof window.Element === false) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
    }
    return null;
  },
  defaults: {
    Element: undefined,
  },
};

var doc = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Moi"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withChannels"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"withMoments"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"me"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"email"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"handle"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"avatar"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channels"},"arguments":[],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withChannels"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"url"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"title"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"description"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"tags"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"members"},"arguments":[],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"handle"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"avatar"},"arguments":[],"directives":[],"selectionSet":null}]}},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"present"},"arguments":[],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}]}],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"moments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"Variable","name":{"kind":"Name","value":"types"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"type"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"content"},"arguments":[],"directives":[],"selectionSet":null}]}}]}},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"moments"},"arguments":[],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"withMoments"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"kind"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"content"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channel"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}]}}],"loc":{"start":0,"end":646}};
    doc.loc.source = {"body":"query Moi($withChannels: Boolean, $withMoments: Boolean, $detailed: Boolean,) {\n  me {\n    id\n    email\n    handle\n    avatar\n    channels @include(if: $withChannels) {\n      id\n      by\n      url\n      title\n      description\n      tags\n      members @include(if: $detailed) {\n        id\n        handle\n        avatar\n      }\n      present @include(if: $detailed)\n      moments(\n        limit: $limit,\n        types: $types\n        ) @include(if: $detailed) {\n          id\n          by\n          type\n          content\n        }\n    }\n    moments @include(if: $withMoments) {\n      id\n      by\n      kind\n      content\n      channel\n    }\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

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

const PewPew = function (ref) {
  var color = ref.color;
  return (React.createElement( 'svg', { width: "500px", height: "300px", viewBox: "0 0 500 300", version: "1.1", xmlns: "http://www.w3.org/2000/svg" },
  React.createElement( 'desc', null, "Pew Pew" ),
  React.createElement( 'g', { id: "Pew-Pew", fill: color, fillRule: "evenodd", stroke: "none", strokeWidth: "1" },
    React.createElement( 'path', { d: "M161.264129,245.455042 C161.849687,244.713935 162.465275,243.995649 163.0154,243.229918 C177.087432,223.624204 189.443026,202.985504 199.933239,181.25376 C201.368009,178.279721 202.003415,174.924919 203.065229,171.767705 C204.87836,166.372756 206.566571,160.927959 208.644555,155.636308 C209.705768,152.933127 211.348336,150.415524 212.996909,147.996415 C215.275484,144.652423 218.753404,143.788799 221.993497,145.458392 C225.196354,147.108768 226.497196,150.4954 225.174133,154.288621 C222.230123,162.727276 219.08432,171.096265 216.220186,179.560744 C212.255201,191.280331 208.171904,202.974093 205.658504,215.126092 C204.444746,220.996696 203.098261,226.865498 204.033954,232.930688 C204.210522,234.079584 204.530027,235.204458 204.904184,236.884862 C206.090917,235.877701 207.090271,235.266317 207.774925,234.405695 C210.463691,231.02627 213.36446,227.760352 215.628021,224.106464 C227.011286,205.724719 237.96274,187.085927 247.956279,167.901215 C254.506732,155.32461 258.54919,141.931226 260.855392,127.973903 C261.687186,122.936294 262.664919,117.922709 263.586198,112.898913 C263.685893,112.35119 263.846246,111.813077 264.348326,111.307995 C264.348326,113.724702 264.397573,116.14261 264.339918,118.557515 C264.084674,129.077156 263.509925,139.563766 261.462571,149.926657 C259.854837,158.062023 257.429121,165.930734 253.982431,173.461322 C246.254855,190.344037 238.499052,207.21414 230.642352,224.0386 C227.598046,230.55542 223.855874,236.671658 219.110745,242.135674 C216.426783,245.226224 213.378874,247.784666 209.535805,249.311924 C202.932502,251.93703 197.512329,249.186404 195.779675,242.275007 C194.188756,235.931752 193.829013,229.471986 194.033208,222.960571 C194.075248,221.609281 194.039213,220.254388 194.039213,218.181809 C193.27048,219.510878 192.794826,220.289821 192.360611,221.090986 C188.054501,229.03657 183.99883,237.129295 179.373815,244.882696 C175.961958,250.601955 171.903284,255.95006 167.948509,261.328194 C165.951002,264.043386 163.265839,266.106955 160.023344,267.25405 C156.789257,268.397542 153.84825,267.975339 151.354069,265.418098 C149.113931,263.122707 148.874302,260.416524 149.579976,257.477318 C152.262136,246.306655 155.023572,235.15401 157.59883,223.958723 C161.407666,207.400919 165.038131,190.802875 168.84036,174.243869 C170.136397,168.599081 171.725514,163.021557 173.171094,157.4098 C173.336852,156.763584 173.432343,156.09995 173.354269,155.328814 C164.832735,164.273152 157.958573,174.442058 150.672418,184.601356 C150.672418,183.871659 150.628577,183.137158 150.678424,182.409864 C151.782878,166.40819 156.931593,151.901943 166.701719,139.103126 C169.284184,135.719496 172.291855,132.782092 175.685694,130.21284 C181.436183,125.860486 188.96497,127.835771 191.860334,134.490123 C193.080098,137.292998 193.118535,140.187161 192.738372,143.167205 C191.934805,149.454006 189.878442,155.381664 187.831088,161.333346 C180.579766,182.414668 173.32424,203.49479 166.236875,224.633167 C164.30423,230.395067 162.94213,236.349151 161.359019,242.226961 C161.091764,243.216706 161.032908,244.265907 160.87796,245.286281 C161.007083,245.342735 161.135606,245.398589 161.264129,245.455042", id: "Fill-1" }),
    React.createElement( 'path', { d: "M338.900248,80.0482763 C349.628889,71.9237211 361.955655,67.9479261 375.233729,66.7846157 C377.845022,66.5563979 380.540395,66.844673 383.156492,67.196609 C388.903978,67.9707479 392.288208,71.2462745 393.545809,76.931301 C394.661073,81.9761165 394.033474,86.9386534 392.52063,91.7642596 C389.170032,102.456866 383.822528,112.160929 377.42402,121.308861 C371.373845,129.956515 364.441428,137.864864 356.938466,145.262125 C341.314552,160.661424 325.236005,175.557443 307.687254,188.777262 C302.990171,192.314638 298.183783,195.708478 293.086717,198.830858 C293.578587,198.339589 294.028416,197.794869 294.568332,197.362456 C309.388078,185.457293 323.105171,172.353985 336.333998,158.737788 C347.295662,147.45662 358.229098,136.131009 367.247306,123.155023 C373.664431,113.92241 379.154272,104.182914 383.21715,93.6752837 C384.784646,89.6232159 385.990597,85.4786598 385.934143,81.0794606 C385.91973,80.009239 385.750968,78.9330117 385.568995,77.8748016 C385.17622,75.5848158 383.769677,74.2959855 381.53074,73.7326478 C378.136901,72.8780321 374.701622,72.8263828 371.276552,73.2377755 C362.165856,74.3332211 353.596876,77.0922547 346.030854,82.3791011 C340.640109,86.1452961 335.473977,90.2315966 330.202746,94.1689549 C328.912114,95.1340762 328.288118,96.2097029 328.862867,97.9435579 C329.584756,100.118234 328.885088,102.207028 327.913961,104.194324 C324.984965,110.191649 321.725654,116.052043 319.191836,122.211522 C310.410253,143.5595 301.859892,165.001767 293.265088,186.426618 C287.156657,201.651751 281.248818,216.959763 274.985439,232.119433 C272.478646,238.189427 269.20312,243.938114 266.37442,249.880787 C263.418999,256.08591 260.578287,262.345084 257.690731,268.582038 C257.324381,269.373593 256.971244,270.171155 256.141852,270.91046 C256.222329,269.954348 256.255361,268.993431 256.389889,268.045726 C257.473323,260.429256 259.448008,253.034998 262.069511,245.814906 C270.28235,223.184705 277.249,200.145513 284.449873,177.187999 C288.680912,163.697322 292.350415,150.030677 296.265552,136.441505 C296.479356,135.701599 296.631301,134.944877 296.989243,133.456656 C294.236815,135.219339 292.03091,136.675128 289.782363,138.058249 C287.530214,139.441969 285.236024,140.75242 282.284807,142.492882 C282.786886,141.196244 282.974265,140.529007 283.288965,139.927833 C289.007023,129.02863 295.712424,118.742611 302.676071,108.61094 C304.449564,106.030277 305.952799,103.264036 307.598369,100.593287 C308.627151,98.9224923 309.564046,97.1748241 310.757985,95.6277474 C314.959596,90.1865536 319.252494,89.0929097 324.744736,91.6039065 C329.621992,87.6046891 334.133498,83.6577216 338.900248,80.0482763 Z", id: "Fill-5" }),
    React.createElement( 'path', { d: "M102.875435,199.836098 C105.540779,192.59979 108.232548,185.579689 110.709312,178.483916 C113.187878,171.381537 115.641821,164.254534 116.763691,156.190036 C115.66224,156.904118 114.924736,157.202603 114.431065,157.730506 C112.088229,160.234897 109.52258,162.596952 107.562909,165.380609 C100.59746,175.275654 96.8126475,186.499167 94.4553974,198.265599 C93.1737741,204.665307 92.7185395,211.122671 93.2620583,217.62688 C93.7437181,223.387578 95.3886883,228.810154 98.4420028,233.749869 C100.253932,236.678865 101.032876,237.065634 104.249546,235.925746 C106.53773,235.116174 108.746639,233.963073 110.819217,232.684452 C118.981008,227.648045 126.028135,221.205696 132.997787,214.693079 C138.312861,209.726939 143.504216,204.628072 148.758031,199.594667 C149.649282,198.740652 150.575366,197.923872 151.640182,196.947941 C151.61736,197.435006 151.676217,197.661422 151.589734,197.785741 C144.593055,207.878374 137.717693,218.057491 130.52763,228.010191 C126.364456,233.773292 121.210936,238.654151 115.201,242.557877 C111.154938,245.185385 106.866845,246.869392 101.906109,246.571508 C97.9663487,246.336083 94.9364566,244.783001 92.9395505,241.316492 C88.9679595,234.423112 86.4089168,226.997024 85.1921554,219.183565 C82.2103091,200.034287 84.7945759,181.569061 92.779798,163.918813 C96.0961636,156.588817 100.530196,150.01314 107.140706,145.153902 C110.131561,142.955804 113.359642,141.416534 117.171481,141.375695 C125.5723,141.283808 130.082605,146.414505 129.483233,155.00991 C128.931906,162.896037 126.165065,170.135948 122.330405,176.976477 C117.96724,184.760508 112.357285,191.567405 105.854278,197.653014 C105.209262,198.255989 104.52581,198.821729 103.837553,199.376059 C103.625551,199.546621 103.337275,199.620492 102.875435,199.836098", id: "Fill-8" }),
    React.createElement( 'path', { d: "M397.068051,163.390009 C394.546244,185.879676 389.577101,207.956749 387.455275,230.46083 C387.381405,231.239773 387.434255,232.03253 387.475094,232.817479 C387.488307,233.093143 387.643255,233.3628 387.768775,233.742963 C389.390923,233.68771 390.433518,232.585058 391.542176,231.687801 C397.17135,227.128249 401.679253,221.564538 405.829214,215.676518 C408.049533,212.52531 409.877078,209.278611 410.766527,205.426534 C411.741257,201.203903 413.50394,197.233513 416.510409,193.944174 C418.507916,191.759889 420.632144,191.182738 422.773187,192.332235 C424.937053,193.493744 425.857131,195.979516 425.026538,198.715728 C424.715441,199.738504 424.224172,200.720442 423.717289,201.668146 C421.33001,206.149024 420.142076,210.948805 419.562523,216.528731 C420.975071,215.983411 422.050698,215.665708 423.034437,215.168433 C426.84087,213.255006 430.364433,210.85992 433.256194,207.757359 C438.140656,202.513153 443.048541,197.255735 447.49999,191.648783 C454.073264,183.36988 457.805827,173.619573 460.875357,163.606816 C463.667422,154.499723 466.349582,145.357196 469.327825,136.311361 C470.601641,132.441267 472.503056,128.77777 474.506569,125.192348 C473.820714,129.533291 472.99973,133.858019 472.482036,138.218782 C471.811196,143.876783 471.467668,149.572019 470.823853,155.234224 C470.178237,160.891624 469.519408,166.556832 468.541074,172.162582 C466.840251,181.899677 462.851844,190.740716 457.162013,198.782992 C451.071599,207.389207 444.542767,215.618863 436.032644,222.050402 C432.865221,224.443086 429.452163,226.331889 425.746626,227.722816 C420.348673,229.749751 415.63057,229.280703 410.607975,226.056226 C409.975572,226.831566 409.30353,227.626725 408.662118,228.447708 C405.261672,232.803066 401.640215,236.954228 397.004991,240.047781 C395.303567,241.181663 393.489235,242.271704 391.572806,242.936538 C384.70465,245.311806 379.352341,241.126411 380.072428,233.909322 C381.060371,224.029291 382.450098,214.181691 384.943077,204.567714 C387.998194,192.785067 391.422662,181.09611 394.759447,169.388534 C395.345006,167.336976 396.289107,165.386314 397.068051,163.390009", id: "Fill-10" }),
    React.createElement( 'path', { d: "M325.96462,249.795145 C328.569907,248.677478 331.034059,247.920756 333.191319,246.64694 C344.970362,239.685095 356.154237,231.847013 366.669675,223.094258 C369.142835,221.036694 371.205805,218.489063 373.958832,216.441108 C373.820701,217.001443 373.779261,217.610424 373.528221,218.116107 C372.21717,220.746017 371.122325,223.53628 369.458136,225.928364 C363.565912,234.403053 357.480904,242.759429 350.050611,249.987329 C345.748104,254.176327 341.136302,258.040416 335.561781,260.482346 C331.897684,262.088279 328.05942,262.673238 324.047591,261.927326 C320.819509,261.329155 318.47367,259.591096 316.877346,256.790623 C315.396333,254.191341 314.572346,251.411288 314.463042,248.384999 C314.187379,240.83219 315.664188,233.520811 317.445489,226.262282 C320.745639,212.814246 324.121461,199.386629 329.279785,186.485114 C331.958342,179.788722 335.066909,173.359585 339.815041,167.845121 C342.947031,164.207449 346.512034,161.423191 351.373074,160.175801 C357.918121,158.497198 363.169534,164.667488 361.200254,170.716462 C360.566649,172.664722 359.545074,174.48566 358.716884,176.37146 C354.163337,186.739757 347.341425,195.369394 338.708185,202.633928 C337.910623,203.303567 337.070421,204.143169 336.708276,205.080664 C332.352918,216.347418 328.065426,227.646604 325.346631,239.44907 C324.734046,242.113213 324.291423,244.874648 325.064361,247.622872 C325.217507,248.166991 325.494372,248.675076 325.96462,249.795145", id: "Fill-12" }),
    React.createElement( 'path', { d: "M74.3352921,140.997815 C74.5214698,141.149159 74.7076476,141.301104 74.8944258,141.453049 C76.3093765,139.853122 77.8162148,138.324663 79.1236628,136.641256 C86.711906,126.868728 94.3475945,117.132234 101.764674,107.231183 C104.995158,102.920268 107.922352,98.3541098 110.67538,93.7188853 C118.765102,80.1014871 119.730824,65.5706169 115.783256,50.4968285 C115.624704,49.8902495 115.302797,49.32511 114.800718,48.1323715 C95.8982747,77.1682873 83.6639967,108.447945 74.3352921,140.997815 M25,264.923105 C25.1957869,264.281693 25.3567405,263.628269 25.5927658,263.003073 C30.3378952,250.394637 34.0530414,237.467898 37.4979297,224.45828 C41.5259746,209.249363 46.9647661,194.499884 52.1152824,179.659719 C59.0705214,159.62039 66.0005363,139.570252 73.2038121,119.619809 C80.6443143,99.011137 89.1496329,78.8252689 98.2783466,58.9060554 C100.28306,54.5308791 102.457736,50.2319757 104.406596,45.8327765 C106.115227,41.9764955 107.666508,38.0475452 109.197369,34.1161926 C111.955202,27.0336321 119.943427,24.704609 125.778596,29.5752582 C127.75148,31.2220301 129.394648,33.4819873 130.614412,35.7677691 C133.52479,41.2191727 134.567986,47.2441237 135.163154,53.3405429 C136.98169,71.9336907 131.770516,88.486691 120.69114,103.360489 C115.797069,109.929559 110.289211,115.926884 104.163965,121.351261 C94.8869093,129.564701 85.4194723,137.548722 75.0986208,144.443303 C73.4302282,145.557967 72.5527907,146.932079 72.0194816,148.835896 C66.5620723,168.313088 61.2043582,187.819708 55.4634784,207.21402 C50.619855,223.575438 44.0838161,239.243794 34.319696,253.378886 C31.5360389,257.406931 28.5007416,261.262611 25.5807543,265.197567 C25.3873698,265.10628 25.1939852,265.014993 25,264.923105", id: "Fill-3" })
  )
));
};

var doc$1 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogOut"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"session"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"logout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"session"},"value":{"kind":"Variable","name":{"kind":"Name","value":"session"}}}],"directives":[],"selectionSet":null}]}}],"loc":{"start":0,"end":66}};
    doc$1.loc.source = {"body":"mutation LogOut($session: String) {\n  logout(session: $session)\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

var doc$2 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"directives":[],"selectionSet":null}]}}],"loc":{"start":0,"end":103}};
    doc$2.loc.source = {"body":"mutation VerifyEmail($token: String!, $email: String!) {\n  verifyEmail(token: $token, email: $email)\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

var doc$3 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"sendVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"directives":[],"selectionSet":null}]}}],"loc":{"start":0,"end":80}};
    doc$3.loc.source = {"body":"mutation SendVerification($email: String) {\n  sendVerification(email: $email)\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

var doc$4 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecoverAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pass"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"word"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"recoverAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"pass"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pass"}}},{"kind":"Argument","name":{"kind":"Name","value":"word"},"value":{"kind":"Variable","name":{"kind":"Name","value":"word"}}}],"directives":[],"selectionSet":null}]}}],"loc":{"start":0,"end":135}};
    doc$4.loc.source = {"body":"mutation RecoverAccount($token: String!, $pass: String!, $word: String!) {\n  recoverAccount(token: $token, pass: $pass, word: $word)\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

var doc$5 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendRecovery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"sendRecovery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"directives":[],"selectionSet":null}]}}],"loc":{"start":0,"end":106}};
    doc$5.loc.source = {"body":"mutation SendRecovery($email: String, $handle: String) {\n  sendRecovery(email: $email, handle: $handle)\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const ActionButton = function (ref) {
  var children = ref.children;
  var onClick = ref.onClick;
  return (React.createElement( 'button', {
  type: "button", onClick: onClick }, children));
};
const props = function (ref) {
  var ownProps = ref.ownProps;
  var mutate = ref.mutate;
  var ref_p = ref.p; if ( ref_p === void 0 ) ref_p = ownProps;
  var ref_p$1 = ref_p;
  var onSuccess = ref_p$1.onSuccess; if ( onSuccess === void 0 ) onSuccess = function () { return undefined; };
  var onFailure = ref_p$1.onFailure; if ( onFailure === void 0 ) onFailure = function () { return undefined; };
  const newProps = Object.assign({}, ownProps, {
    onClick: function () {
      return mutate()
        .then(onSuccess)
        .catch(onFailure);
    },
  });
  return newProps;
};
const logOut = reactApollo.graphql(doc$1, {
  alias: 'logout',
  props: props,
  options: function (ref) {
    var session = ref.session;
    return ({
    variables: { session: session },
    optimisticResponse: {
      __typename: 'Mutation',
      logout: true,
    },
    update: function (proxy, ref) {
      var logout = ref.data.logout;
      if (logout) {
        const data = proxy.readQuery({ query: doc });
        data.me = null;
        proxy.writeQuery({ query: doc, data: data });
      }
    },
  });
},
});
const verifyEmail = reactApollo.graphql(doc$2, {
  alias: 'verifyEmail',
  props: props,
  options: function (ref) {
    var email = ref.email;
    var token = ref.token;
    return ({
    variables: { email: email, token: token },
    optimisticResponse: {
      __typename: 'Mutation',
      verifyEmail: true,
    },
  });
},
});
const sendVerification = reactApollo.graphql(doc$3, {
  alias: 'sendVerification',
  props: props,
  options: function (ref) {
    var email = ref.email;
    return ({
    variables: { email: email },
    optimisticResponse: {
      __typename: 'Mutation',
      sendVerification: true,
    },
  });
},
});
const sendRecovery = reactApollo.graphql(doc$5, {
  alias: 'sendRecovery',
  props: props,
  options: function (ref) {
    var email = ref.email;
    var handle = ref.handle;
    return ({
    variables: { email: email, handle: handle },
    optimisticResponse: {
      __typename: 'Mutation',
      sendRecovery: true,
    },
  });
},
});
const recoverAccount = reactApollo.graphql(doc$4, {
  alias: 'recoverAccount',
  props: props,
  options: function (ref) {
    var token = ref.token;
    var pass = ref.pass;
    var word = ref.word;
    return ({
    variables: { token: token, pass: pass, word: word },
    optimisticResponse: {
      __typename: 'Mutation',
      recoverAccount: true,
    },
  });
},
});

const LogoutButton = logOut(ActionButton);

var doc$6 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogIn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}],"loc":{"start":0,"end":146}};
    doc$6.loc.source = {"body":"mutation LogIn($email: String, $handle: String, $password: String!) {\n  login(email: $email, handle: $handle, password: $password) {\n    id\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

var Login = (function (superclass) {
  function Login(props) {
    superclass.call(this, props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      handle: '',
      email: '',
      password: '',
    };
  }
  if ( superclass ) Login.__proto__ = superclass;
  Login.prototype = Object.create( superclass && superclass.prototype );
  Login.prototype.constructor = Login;
  Login.prototype.onSubmit = function (event) {
    event.preventDefault();
    var ref = this.state;
    var handle = ref.handle;
    var email = ref.email;
    var password = ref.password;
    this.props.mutate({
      variables: {
        handle: handle,
        email: email,
        password: password,
      },
    }).then(function (ref) {
      var login = ref.data.login;
      console.log(login);
    }).catch(function (result) {
      console.log(result);
    });
  };
  Login.prototype.onChange = function (ref) {
    var ref_target = ref.target;
    var id = ref_target.id;
    var value = ref_target.value;
    return this.setState({ [id.replace('login-', '')]: value });
  };
  Login.prototype.render = function () {
    var ref = this;
    var ref_state = ref.state;
    var handle = ref_state.handle;
    var email = ref_state.email;
    var password = ref_state.password;
    var onChange = ref.onChange;
    var onSubmit = ref.onSubmit;
    return (React.createElement( 'form', { id: "login-form", onSubmit: onSubmit },
      React.createElement( 'div', null,
        React.createElement( 'label', { htmlFor: "login-handle" }, "Handle"),
        React.createElement( 'input', { id: "login-handle", type: "text", value: handle, onChange: onChange })
      ),
      React.createElement( 'div', null,
        React.createElement( 'label', { htmlFor: "login-email" }, "Email"),
        React.createElement( 'input', { id: "login-email", type: "email", value: email, onChange: onChange })
      ),
      React.createElement( 'div', null,
        React.createElement( 'label', { htmlFor: "login-password" }, "Password"),
        React.createElement( 'input', { id: "login-password", type: "password", value: password, onChange: onChange })
      ),
      React.createElement( 'button', { type: "submit" }, "Start")
    ));
  };
  return Login;
}(React.PureComponent));
Login.propTypes = {
  mutate: PropTypes.func,
};
Login.defaultProps = {
  mutate: function () { return Promise.resolve({ login: {} }); },
};
const LoginForm = reactApollo.graphql(doc$6, {
  alias: 'LoginForm',
  options: {
  },
})(Login);

var doc$7 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}],"loc":{"start":0,"end":150}};
    doc$7.loc.source = {"body":"mutation SignUp($email: String!, $handle: String!, $password: String!) {\n  signup(email: $email, handle: $handle, password: $password) {\n    id\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const renderField = function (props) {
  var input = props.input;
  var id = props.id;
  var label = props.label;
  var type = props.type;
  var props_meta = props.meta;
  var touched = props_meta.touched;
  var error = props_meta.error;
  var warning = props_meta.warning;
  return (React.createElement( 'div', null,
    React.createElement( 'label', { htmlFor: id }, label),
    React.createElement( 'input', Object.assign({}, { id: id }, input, { type: type })),
    touched && ((error && React.createElement( 'span', null, error )) || (warning && React.createElement( 'span', null, warning )))
  ));
};

const SignUpForm = function (props) {
  var handleSubmit = props.handleSubmit;
  var pristine = props.pristine;
  var reset = props.reset;
  var submitting = props.submitting;
  return (React.createElement( 'form', { onSubmit: handleSubmit },
    React.createElement( reduxForm.Field, { id: "handle", name: "handle", type: "text", component: renderField, label: "Grab A Handle" }),
    React.createElement( reduxForm.Field, { id: "email", name: "email", type: "email", component: renderField, label: "Set Your Email" }),
    React.createElement( reduxForm.Field, { id: "password", name: "password", type: "password", component: renderField, label: "Password" }),
    React.createElement( 'button', { type: "submit", disabled: pristine || submitting }, "Get Started")
  ));
};
const SignUp = reactApollo.graphql(doc$7, {
  alias: 'SignUp',
  props: function (ref) {
    var mutate = ref.mutate;
    return ({
    onSubmit: function (variables) {
      console.log(variables);
      return mutate({ variables: variables }).catch(function (errors) { return console.log(errors); });
    },
    onSubmitSuccess: function(result) {
      console.log(result);
    },
    onSubmitFail: function(result) {
      console.log(result);
    },
  });
},
})(reduxForm.reduxForm({
  form: 'sign-up',
})(SignUpForm));

const MenuButton = function (ref, ref$1) {
  var me = ref.me;
  var channel = ref.channel;
  var children = ref.children;
  var modal = ref$1.modal;
  return (React.createElement( 'button', { onClick: function () { return modal.open(
  function (modalProps) { return (React.createElement( MainMenu, Object.assign({}, { me: me, channel: channel.url }, modalProps))); }, {
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
  }); } }, children));
};
MenuButton.contextTypes = {
  modal: PropTypes.object,
};
var Nav = (function (superclass) {
  function Nav(props) {
    superclass.call(this, props);
    this.state = {
      login: false,
      signup: false,
    };
  }
  if ( superclass ) Nav.__proto__ = superclass;
  Nav.prototype = Object.create( superclass && superclass.prototype );
  Nav.prototype.constructor = Nav;
  Nav.prototype.render = function () {
    var ref = this.props;
    var data = ref.data;
    var channel = ref.channel;
    return (React.createElement( 'header', null,
      React.createElement( 'section', null,
        React.createElement( reactRouterDom.Switch, null,
          React.createElement( reactRouterDom.Route, { exact: true, path: "/?signup", component: SignUp }),
          React.createElement( reactRouterDom.Route, { exact: true, path: "/?login", component: LoginForm }),
          React.createElement( reactRouterDom.Route, {
            exact: true, path: "/:channel", render: function () { return (
              React.createElement( 'nav', null,
                React.createElement( reactRouterDom.NavLink, { to: "/" },
                  React.createElement( PewPew, { color: "#2bc0da" })
                ),
                React.createElement( 'span', null, channel.url )
              )
            ); } })
        ),
        React.createElement( 'div', null,
          React.createElement( MenuButton, { me: data.me, channel: channel }, "Menu"),
          data.me ? (React.createElement( LogoutButton, null, "Log Out" )) : (React.createElement( reactRouterDom.NavLink, { to: "/?login" }, "login"))
        )
      )
    ));
  };
  return Nav;
}(React.PureComponent));
Nav.propTypes = {
  channel: PropTypes.object,
};
Nav.defaultProps = {
  channel: {},
};
const Header = reactApollo.graphql(doc, {
  alias: 'Header',
})(Nav);

const AuthorSection = function (ref) {
  var me = ref.data.me;
  if (me) {
    return (React.createElement( 'section', { className: "author-view" },
      React.createElement( 'header', null,
        React.createElement( 'h3', null, "Dashboard" ),
        React.createElement( 'p', null, me.handle )
      )
    ));
  }
  return (React.createElement( 'section', { className: "author-registration" },
    React.createElement( 'h3', null, "Sign Up" ),
    React.createElement( SignUp, null )
  ));
};
const AuthorView = reactApollo.graphql(doc)(AuthorSection);

var doc$8 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Channels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"url"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"title"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"description"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"tags"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}],"loc":{"start":0,"end":121}};
    doc$8.loc.source = {"body":"query Channels($limit: Int) {\n  channels(limit: $limit) {\n    id\n    by\n    url\n    title\n    description\n    tags\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const ChannelSection = function (ref) {
  var channels = ref.data.channels;
  var filter = ref.filter;
  return (React.createElement( 'section', { className: "home-channels" },
  React.createElement( 'header', null,
    React.createElement( 'h3', null, "Channels" )
  ),
  channels.filter(filter || (function () { return true; })).map(function (c) { return (React.createElement( 'p', null, c.id )); })
));
};
const ChannelsView = reactApollo.graphql(doc$8)(ChannelSection);

var doc$9 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Contributors"},"variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"authors"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"handle"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"avatar"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channels"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"moments"},"arguments":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}]}}],"loc":{"start":0,"end":127}};
    doc$9.loc.source = {"body":"query Contributors {\n  authors {\n    id\n    handle\n    avatar\n    channels {\n      id\n    }\n    moments {\n      id\n    }\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const ContributorsList = function (ref) {
  var ref_data = ref.data;
  var authors = ref_data.authors;
  var loading = ref_data.loading;
  var error = ref_data.error;
  var refetch = ref_data.refetch;
  if (authors) {
    return (React.createElement( 'ul', { className: "contributors-list" }, authors.map(function (author) { return (React.createElement( 'li', { className: "contributors-list-item", key: author.id },
        React.createElement( 'section', null,
          React.createElement( 'header', null,
            React.createElement( 'p', null, author.id )
          ),
          React.createElement( 'p', null, author.handle )
        )
      )); })));
  } else if (loading) { return (React.createElement( 'div', null, "Loading" )); }
  else if (error) { return (React.createElement( 'button', { onClick: function () { return refetch(); } }, "retry")); }
  return null;
};
const ContributorsView = reactApollo.graphql(doc$9)(ContributorsList);
const ContributorsSection = function () { return (React.createElement( 'section', { className: "contributors-view" },
  React.createElement( 'header', null,
    React.createElement( 'h3', null, "Contributors" )
  ),
  React.createElement( ContributorsView, null )
)); };

const ChannelSearch = function (ref) {
  var channel = ref.channel;
  var updateChannel = ref.updateChannel;
  var changeChannel = ref.changeChannel;
  return (React.createElement( 'form', {
  id: "channel-search", onSubmit: function (event) {
    event.preventDefault();
    updateChannel(channel);
  } },
  console.log(channel) || null,
  React.createElement( 'label', { htmlFor: "remote" }, "/"),
  React.createElement( 'input', {
    id: "remote", type: "text", form: "channel-search", value: channel, placeholder: "Tune in to...", onChange: function (ref) {
      var value = ref.target.value;
      return changeChannel(value);
  } }),
  React.createElement( 'button', { type: "submit" }, "Go")
));
};
const Search = reactRouterDom.withRouter(reactRedux.connect(
  function (ref) {
    var channel = ref.channel;
    return ({ channel: channel.url });
},
  function (dispatch, ref) {
    var history = ref.history;
    return ({
    changeChannel: function (url) { return dispatch({ type: '@@channel/change', url: url }); },
    updateChannel: function (url) { return history.push(`/${url}`); },
  });
}, function (ref, ref$1) {
    var channel = ref.channel;
    var changeChannel = ref$1.changeChannel;
    var updateChannel = ref$1.updateChannel;
    return ({
    channel: channel,
    changeChannel: changeChannel,
    updateChannel: updateChannel,
  });
})(ChannelSearch));

const Home = function (ref) {
  var staticContext = ref.staticContext;
  if (staticContext) { Object.assign(staticContext, { channel: '', view: 'home' }); }
  return (React.createElement( 'section', { className: "home" },
    React.createElement( 'header', null,
      React.createElement( PewPew, { color: "#fff" })
    ),
    React.createElement( Search, null ),
    React.createElement( ChannelsView, null ),
    React.createElement( ContributorsSection, null ),
    React.createElement( AuthorView, null ),
    React.createElement( 'section', null,
      React.createElement( 'header', null,
        React.createElement( 'h3', null, "Log In" )
      ),
      React.createElement( LoginForm, null )
    )
  ));
};

var doc$10 = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Channel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kinds"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Types"}}},"defaultValue":null},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"momentum"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":null}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"channel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"url"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"title"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"description"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"tags"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"moments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"kinds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kinds"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"momentum"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":null,"name":{"kind":"Name","value":"id"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"by"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"kinds"},"arguments":[],"directives":[],"selectionSet":null},{"kind":"Field","alias":null,"name":{"kind":"Name","value":"content"},"arguments":[],"directives":[],"selectionSet":null}]}}]}}]}}],"loc":{"start":0,"end":303}};
    doc$10.loc.source = {"body":"query Channel($id: ID, $url: String, $limit: Int, $kinds: [Types], $momentum: Boolean) {\n  channel(id: $id, url: $url) {\n    id\n    by\n    url\n    title\n    description\n    tags\n    moments (limit: $limit, kinds: $kinds) @include(if: $momentum) {\n      id\n      by\n      kinds\n      content\n    }\n  }\n}\n","name":"GraphQL request","locationOffset":{"line":1,"column":1}};

const ChannelView$1 = function (ref) {
  var params = ref.match.params;
  var staticContext = ref.staticContext;
  if (staticContext) { Object.assign(staticContext, params); }
  return (React.createElement( 'h3', null, params.view ));
};
var Channel = (function (superclass) {
  function Channel () {
    superclass.apply(this, arguments);
  }
  if ( superclass ) Channel.__proto__ = superclass;
  Channel.prototype = Object.create( superclass && superclass.prototype );
  Channel.prototype.constructor = Channel;
  Channel.prototype.render = function () {
    var ref = this.props;
    var params = ref.match.params;
    var staticContext = ref.staticContext;
    var data = ref.data;
    if (staticContext) { Object.assign(staticContext, params); }
    return (React.createElement( 'section', { className: "nexus" },
      React.createElement( 'header', null,
        React.createElement( 'h1', null, React.createElement( 'span', null, "/" ), params.channel )
      ),
      React.createElement( reactRouterDom.Route, { path: "/:channel/:view", component: ChannelView$1 }),
      React.createElement( 'footer', null,
        React.createElement( 'h5', null, data.me ? data.me.handle : null )
      ),
      React.createElement( Helmet, null,
        React.createElement( 'title', null, params.channel )
      )
    ));
  };
  return Channel;
}(React.PureComponent));
const Prism = reactApollo.graphql(doc$10, {
  alias: 'Prism',
  options: function (ref) {
    var params = ref.match.params;
    var limit = ref.limit;
    var kinds = ref.kinds;
    return ({
    variables: {
      limit: limit,
      kinds: kinds,
      id: params.channel,
    },
  });
},
})(Channel);

const Modal = function (ref) {
  var match = ref.match;
  var location = ref.location;
  var history = ref.history;
  var modal = ref.modal;
  var appElement = ref.appElement;
  var view = modal.view;
  var label = modal.label;
  var role = modal.role;
  var isOpen = modal.isOpen;
  var onOpen = modal.onOpen;
  var onClose = modal.onClose;
  var close = modal.close;
  var delay = modal.delay;
  var style = modal.style;
  var styleNames = modal.styleNames;
  const View = function () {
    if (isOpen && view) {
      const V = view;
      return (React.createElement( V, {
        modal: modal, match: match, location: location, history: history }));
    } return null;
  };
  return (React.createElement( ReactModal, {
    contentLabel: label, role: role, isOpen: isOpen, onAfterOpen: onOpen, onRequestClose: function () { return onClose(close); }, closeTimeoutMS: delay, shouldCloseOnOverlayClick: true, style: style, className: styleNames.className, portalClassName: styleNames.portalClassName, overlayClassName: styleNames.overlayClassName, bodyOpenClassName: styleNames.bodyOpenClassName, appElement: appElement, ariaHideApp: true },
    React.createElement( View, null )
  ));
};
Modal.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
  appElement: types.Element,
};
Modal.defaultProps = {
  modal: {},
  appElement: types.defaults.Element,
};
const ModalView = reactRouterDom.withRouter(reactRedux.connect(
  function (ref) {
    var modal = ref.modal;
    return ({ modal: modal });
},
  function (dispatch) { return redux.bindActionCreators({ open: openModal, close: closeModal }, dispatch); },
  function (ref, ref$1, ref$2) {
    var modal = ref.modal;
    var open = ref$1.open;
    var close = ref$1.close;
    var match = ref$2.match;
    var location = ref$2.location;
    var history = ref$2.history;
    var appElement = ref$2.appElement;
    Object.assign(modal, { open: open, close: close });
    return {
      modal: modal,
      match: match,
      location: location,
      history: history,
      appElement: appElement,
    };
  })(Modal));

var Application$1 = (function (superclass) {
  function Application () {
    superclass.apply(this, arguments);
  }
  if ( superclass ) Application.__proto__ = superclass;
  Application.prototype = Object.create( superclass && superclass.prototype );
  Application.prototype.constructor = Application;
  Application.prototype.getChildContext = function () {
    var ref = this.props;
    var app = ref.app;
    var modal = ref.modal;
    return {
      modal: modal,
      app: app,
    };
  };
  Application.prototype.componentWillReceiveProps = function (Props) {
    var channel = Props.channel;
    var modal = Props.modal;
    var location = Props.location;
    if (modal.isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = 'unset'; }
    const path = location.pathname.replace(/^\//, '');
    if (path !== channel.url) { channel.change(path); }
    if (location.pathname !== this.props.location.pathname) {
      if (modal.view) { modal.close(); }
    }
  };
  Application.prototype.render = function () {
    var ref = this.props;
    var app = ref.app;
    var staticContext = ref.staticContext;
    var channel = ref.channel;
    return (React.createElement( 'main', { id: "view" },
      React.createElement( Header, { channel: channel }),
      React.createElement( reactRouterDom.Switch, null,
        React.createElement( reactRouterDom.Route, { exact: true, path: "/", component: Home }),
        React.createElement( reactRouterDom.Route, { path: "/:channel", component: Prism })
      ),
      React.createElement( 'footer', null,
        React.createElement( 'h6', null, React.createElement( 'a', { href: app.hrefs.github }, "github") )
      ),
      React.createElement( ModalView, { appElement: app.appElement }),
      React.createElement( Helmet, {
        encodeSpecialCharacters: !!staticContext, titleTemplate: "%s | Pew Pew" },
        React.createElement( 'title', { itemProp: "name", lang: "en" }, "Shoot")
      )
    ));
  };
  return Application;
}(React.Component));
Application$1.propTypes = {
  app: PropTypes.shape({
    hrefs: PropTypes.object,
    appElement: types.Element,
    upload: PropTypes.func,
  }),
  // eslint-disable-next-line react/forbid-prop-types
  channel: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  modal: PropTypes.object,
};
Application$1.defaultProps = {
  app: {
    appElement: types.defaults.Element,
    upload: function () { return Promise.resolve(); },
  },
  channel: {},
  modal: {},
};
Application$1.childContextTypes = {
  app: PropTypes.object,
  modal: PropTypes.object,
};

const Root = reactApollo.compose(
  reactApollo.withApollo,
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
  var head = ref.head;
  var css = ref.css;
  var scripts = ref.scripts;
  var html = ref.html;
  var window = ref.window;
  return (
  React.createElement( 'html', { lang: "en" },
    React.createElement( 'head', null,
      React.createElement( 'meta', { charSet: "utf-8" }),
      React.createElement( 'meta', { httpEquiv: "X-UA-Compatible", content: "IE=edge" }),
      React.createElement( 'meta', { httpEquiv: "Content-Language", content: "en" }),
      React.createElement( 'meta', { name: "viewport", content: "width=device-width, initial-scale=1" }),
      head.meta.toComponent(),
      head.title.toComponent(),
      css.map(function (href) { return React.createElement( 'link', { key: href, rel: "stylesheet", href: href }); }),
      React.createElement( 'link', { rel: "manifest", href: "/manifest.json" })
    ),
    React.createElement( 'body', null,
      React.createElement( 'div', {
        id: "app", dangerouslySetInnerHTML: { __html: html } }),
      React.createElement( 'script', {
        id: "$$", dangerouslySetInnerHTML: {
          __html: Object.keys(window).reduce(
            /* eslint-disable */
            function (out, key) { return out += `window.${key}=${JSON.stringify(window[key])};`; }, ''),
            /* eslint-enable */
        } }),
      scripts.map(function (src) { return React.createElement( 'script', { key: src, src: `/${src}`, defer: true }); })
    )
  ));
};
Html.propTypes = {
  head: PropTypes.shape({
    meta: PropTypes.object,
    title: PropTypes.object,
  }).isRequired,
  css: PropTypes.arrayOf(PropTypes.string).isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  html: PropTypes.string.isRequired,
  window: PropTypes.shape({
    __$$__: PropTypes.object,
    pewpew: PropTypes.object,
  }).isRequired,
};

function render(ctx, ref) {
  var hrefs = ref.hrefs;
  var meta = ref.meta; if ( meta === void 0 ) meta = [];
  var css = ref.css; if ( css === void 0 ) css = [];
  var scripts = ref.scripts; if ( scripts === void 0 ) scripts = [];
  var networkInterface = ref.networkInterface;
  const client = new reactApollo.ApolloClient({
    networkInterface: networkInterface,
    dataIdFromObject: function (o) { return o.id; },
    queryDeduplication: true,
    ssrMode: true,
  });
  const store = configureStore(false, {
    apollo: client.reducer(),
  }, [client.middleware()]);
  const app = (React.createElement( reactRouterDom.StaticRouter, { location: ctx.path, context: ctx.state },
    React.createElement( reactApollo.ApolloProvider, { client: client, store: store },
      React.createElement( Root, { app: { hrefs: hrefs } })
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
      if (ctx.state.view) { print.log(`view: ${ctx.state.view}`); }
      if (ctx.state.channel) { print.log(`channel: ${ctx.state.channel}`); }
      if (ctx.state.search) { print.log(`search: ${ctx.state.search}`); }
      if (ctx.state.hash) { print.log(`hash: ${ctx.state.hash}`); }
      const window = {
        pewpew: { hrefs: hrefs },
        __$$__: store.getState(),
      };
      ctx.type = 'text/html';
      ctx.body = `<!DOCTYPE html>\n${
        ReactDOMServer.renderToStaticMarkup(
          React.createElement( Html, {
            html: html, meta: meta, head: head, css: css, scripts: scripts, window: window }))
          .replace(/(<\/head>)<body>/g, `${meta.join('')}</head>`)
      }`;
      return resolve();
    }).catch(reject);
  });
}

module.exports = render;
