!function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="https://pew-pew-pew.herokuapp.com",t(t.s=0)}([function(e,t,n){"use strict";function r(e,t){postMessage({type:e,payload:t})}var o=void 0,a=[];o=!!self.fetch,onmessage=function(e){switch(e.data.type){default:break;case"setup":r("initialized",o);break;case"load":r("loaded",a.length);break;case"push":r("sending")}}}]);
//# sourceMappingURL=../maps/upload.25ddd60262ef751818a5.js.map