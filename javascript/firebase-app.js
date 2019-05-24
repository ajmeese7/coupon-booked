!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).firebase=e()}(this,function(){"use strict";!function(t){if(!t.fetch){var e="URLSearchParams"in t,r="Symbol"in t&&"iterator"in Symbol,s="FileReader"in t&&"Blob"in t&&function(){try{return new Blob,!0}catch(t){return!1}}(),n="FormData"in t,o="ArrayBuffer"in t;if(o)var i=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],a=function(t){return t&&DataView.prototype.isPrototypeOf(t)},u=ArrayBuffer.isView||function(t){return t&&-1<i.indexOf(Object.prototype.toString.call(t))};d.prototype.append=function(t,e){t=l(t),e=p(e);var r=this.map[t];this.map[t]=r?r+","+e:e},d.prototype.delete=function(t){delete this.map[l(t)]},d.prototype.get=function(t){return t=l(t),this.has(t)?this.map[t]:null},d.prototype.has=function(t){return this.map.hasOwnProperty(l(t))},d.prototype.set=function(t,e){this.map[l(t)]=p(e)},d.prototype.forEach=function(t,e){for(var r in this.map)this.map.hasOwnProperty(r)&&t.call(e,this.map[r],r,this)},d.prototype.keys=function(){var r=[];return this.forEach(function(t,e){r.push(e)}),h(r)},d.prototype.values=function(){var e=[];return this.forEach(function(t){e.push(t)}),h(e)},d.prototype.entries=function(){var r=[];return this.forEach(function(t,e){r.push([e,t])}),h(r)},r&&(d.prototype[Symbol.iterator]=d.prototype.entries);var c=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];w.prototype.clone=function(){return new w(this,{body:this._bodyInit})},g.call(w.prototype),g.call(O.prototype),O.prototype.clone=function(){return new O(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new d(this.headers),url:this.url})},O.error=function(){var t=new O(null,{status:0,statusText:""});return t.type="error",t};var f=[301,302,303,307,308];O.redirect=function(t,e){if(-1===f.indexOf(e))throw new RangeError("Invalid status code");return new O(null,{status:e,headers:{location:t}})},t.Headers=d,t.Request=w,t.Response=O,t.fetch=function(r,o){return new Promise(function(n,t){var e=new w(r,o),i=new XMLHttpRequest;i.onload=function(){var t,o,e={status:i.status,statusText:i.statusText,headers:(t=i.getAllResponseHeaders()||"",o=new d,t.replace(/\r?\n[\t ]+/g," ").split(/\r?\n/).forEach(function(t){var e=t.split(":"),r=e.shift().trim();if(r){var n=e.join(":").trim();o.append(r,n)}}),o)};e.url="responseURL"in i?i.responseURL:e.headers.get("X-Request-URL");var r="response"in i?i.response:i.responseText;n(new O(r,e))},i.onerror=function(){t(new TypeError("Network request failed"))},i.ontimeout=function(){t(new TypeError("Network request failed"))},i.open(e.method,e.url,!0),"include"===e.credentials?i.withCredentials=!0:"omit"===e.credentials&&(i.withCredentials=!1),"responseType"in i&&s&&(i.responseType="blob"),e.headers.forEach(function(t,e){i.setRequestHeader(e,t)}),i.send(void 0===e._bodyInit?null:e._bodyInit)})},t.fetch.polyfill=!0}function l(t){if("string"!=typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function p(t){return"string"!=typeof t&&(t=String(t)),t}function h(e){var t={next:function(){var t=e.shift();return{done:void 0===t,value:t}}};return r&&(t[Symbol.iterator]=function(){return t}),t}function d(e){this.map={},e instanceof d?e.forEach(function(t,e){this.append(e,t)},this):Array.isArray(e)?e.forEach(function(t){this.append(t[0],t[1])},this):e&&Object.getOwnPropertyNames(e).forEach(function(t){this.append(t,e[t])},this)}function y(t){if(t.bodyUsed)return Promise.reject(new TypeError("Already read"));t.bodyUsed=!0}function v(r){return new Promise(function(t,e){r.onload=function(){t(r.result)},r.onerror=function(){e(r.error)}})}function b(t){var e=new FileReader,r=v(e);return e.readAsArrayBuffer(t),r}function m(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function g(){return this.bodyUsed=!1,this._initBody=function(t){if(this._bodyInit=t)if("string"==typeof t)this._bodyText=t;else if(s&&Blob.prototype.isPrototypeOf(t))this._bodyBlob=t;else if(n&&FormData.prototype.isPrototypeOf(t))this._bodyFormData=t;else if(e&&URLSearchParams.prototype.isPrototypeOf(t))this._bodyText=t.toString();else if(o&&s&&a(t))this._bodyArrayBuffer=m(t.buffer),this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!o||!ArrayBuffer.prototype.isPrototypeOf(t)&&!u(t))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=m(t)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):e&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},s&&(this.blob=function(){var t=y(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?y(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(b)}),this.text=function(){var t,e,r,n=y(this);if(n)return n;if(this._bodyBlob)return t=this._bodyBlob,e=new FileReader,r=v(e),e.readAsText(t),r;if(this._bodyArrayBuffer)return Promise.resolve(function(t){for(var e=new Uint8Array(t),r=new Array(e.length),n=0;n<e.length;n++)r[n]=String.fromCharCode(e[n]);return r.join("")}(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},n&&(this.formData=function(){return this.text().then(_)}),this.json=function(){return this.text().then(JSON.parse)},this}function w(t,e){var r,n,o=(e=e||{}).body;if(t instanceof w){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new d(t.headers)),this.method=t.method,this.mode=t.mode,o||null==t._bodyInit||(o=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"omit",!e.headers&&this.headers||(this.headers=new d(e.headers)),this.method=(r=e.method||this.method||"GET",n=r.toUpperCase(),-1<c.indexOf(n)?n:r),this.mode=e.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&o)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(o)}function _(t){var o=new FormData;return t.trim().split("&").forEach(function(t){if(t){var e=t.split("="),r=e.shift().replace(/\+/g," "),n=e.join("=").replace(/\+/g," ");o.append(decodeURIComponent(r),decodeURIComponent(n))}}),o}function O(t,e){e||(e={}),this.type="default",this.status=void 0===e.status?200:e.status,this.ok=200<=this.status&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new d(e.headers),this.url=e.url||"",this._initBody(t)}}("undefined"!=typeof self?self:void 0);var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function e(t,e){return t(e={exports:{}},e.exports),e.exports}function r(e){var r=this.constructor;return this.then(function(t){return r.resolve(e()).then(function(){return t})},function(t){return r.resolve(e()).then(function(){return r.reject(t)})})}var n=setTimeout;function o(){}function i(t){if(!(this instanceof i))throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],l(t,this)}function s(r,n){for(;3===r._state;)r=r._value;0!==r._state?(r._handled=!0,i._immediateFn(function(){var t=1===r._state?n.onFulfilled:n.onRejected;if(null!==t){var e;try{e=t(r._value)}catch(t){return void u(n.promise,t)}a(n.promise,e)}else(1===r._state?a:u)(n.promise,r._value)})):r._deferreds.push(n)}function a(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var r=t.then;if(t instanceof i)return e._state=3,e._value=t,void c(e);if("function"==typeof r)return void l((n=r,o=t,function(){n.apply(o,arguments)}),e)}e._state=1,e._value=t,c(e)}catch(t){u(e,t)}var n,o}function u(t,e){t._state=2,t._value=e,c(t)}function c(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,r=t._deferreds.length;e<r;e++)s(t,t._deferreds[e]);t._deferreds=null}function f(t,e,r){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=r}function l(t,e){var r=!1;try{t(function(t){r||(r=!0,a(e,t))},function(t){r||(r=!0,u(e,t))})}catch(t){if(r)return;r=!0,u(e,t)}}i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var r=new this.constructor(o);return s(this,new f(t,e,r)),r},i.prototype.finally=r,i.all=function(e){return new i(function(n,o){if(!e||void 0===e.length)throw new TypeError("Promise.all accepts an array");var i=Array.prototype.slice.call(e);if(0===i.length)return n([]);var s=i.length;function a(e,t){try{if(t&&("object"==typeof t||"function"==typeof t)){var r=t.then;if("function"==typeof r)return void r.call(t,function(t){a(e,t)},o)}i[e]=t,0==--s&&n(i)}catch(t){o(t)}}for(var t=0;t<i.length;t++)a(t,i[t])})},i.resolve=function(e){return e&&"object"==typeof e&&e.constructor===i?e:new i(function(t){t(e)})},i.reject=function(r){return new i(function(t,e){e(r)})},i.race=function(o){return new i(function(t,e){for(var r=0,n=o.length;r<n;r++)o[r].then(t,e)})},i._immediateFn="function"==typeof setImmediate&&function(t){setImmediate(t)}||function(t){n(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)};var p=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==t)return t;throw new Error("unable to locate global object")}();"Promise"in p?p.Promise.prototype.finally||(p.Promise.prototype.finally=r):p.Promise=i;var h,d,y,g=function(n,o,t){if(function(t){if("function"!=typeof t)throw TypeError(String(t)+" is not a function")}(n),void 0===o)return n;switch(t){case 0:return function(){return n.call(o)};case 1:return function(t){return n.call(o,t)};case 2:return function(t,e){return n.call(o,t,e)};case 3:return function(t,e,r){return n.call(o,t,e,r)}}return function(){return n.apply(o,arguments)}},v=function(t){try{return!!t()}catch(t){return!0}},b={}.toString,m=function(t){return b.call(t).slice(8,-1)},w="".split,_=v(function(){return!Object("z").propertyIsEnumerable(0)})?function(t){return"String"==m(t)?w.call(t,""):Object(t)}:Object,O=function(t){if(null==t)throw TypeError("Can't call method on "+t);return t},S=function(t){return Object(O(t))},A=Math.ceil,j=Math.floor,E=function(t){return isNaN(t=+t)?0:(0<t?j:A)(t)},T=Math.min,P=function(t){return 0<t?T(E(t),9007199254740991):0},x=function(t){return"object"==typeof t?null!==t:"function"==typeof t},I=Array.isArray||function(t){return"Array"==m(t)},k="object"==typeof window&&window&&window.Math==Math?window:"object"==typeof self&&self&&self.Math==Math?self:Function("return this")(),L=!v(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}),F=k.document,N=x(F)&&x(F.createElement),R=function(t){return N?F.createElement(t):{}},D=!L&&!v(function(){return 7!=Object.defineProperty(R("div"),"a",{get:function(){return 7}}).a}),B=function(t){if(!x(t))throw TypeError(String(t)+" is not an object");return t},C=function(t,e){if(!x(t))return t;var r,n;if(e&&"function"==typeof(r=t.toString)&&!x(n=r.call(t)))return n;if("function"==typeof(r=t.valueOf)&&!x(n=r.call(t)))return n;if(!e&&"function"==typeof(r=t.toString)&&!x(n=r.call(t)))return n;throw TypeError("Can't convert object to primitive value")},M=Object.defineProperty,U={f:L?M:function(t,e,r){if(B(t),e=C(e,!0),B(r),D)try{return M(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported");return"value"in r&&(t[e]=r.value),t}},G=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}},z=L?function(t,e,r){return U.f(t,e,G(1,r))}:function(t,e,r){return t[e]=r,t},H=function(e,r){try{z(k,e,r)}catch(t){k[e]=r}return r},V=e(function(t){var e="__core-js_shared__",r=k[e]||H(e,{});(t.exports=function(t,e){return r[t]||(r[t]=void 0!==e?e:{})})("versions",[]).push({version:"3.0.1",mode:"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})}),q=0,W=Math.random(),$=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++q+W).toString(36))},J=!v(function(){return!String(Symbol())}),K=V("wks"),Y=k.Symbol,X=function(t){return K[t]||(K[t]=J&&Y[t]||(J?Y:$)("Symbol."+t))},Q=X("species"),Z=function(t,e){var r;return I(t)&&("function"!=typeof(r=t.constructor)||r!==Array&&!I(r.prototype)?x(r)&&null===(r=r[Q])&&(r=void 0):r=void 0),new(void 0===r?Array:r)(0===e?0:e)},tt=function(l,t){var p=1==l,h=2==l,d=3==l,y=4==l,v=6==l,b=5==l||v,m=t||Z;return function(t,e,r){for(var n,o,i=S(t),s=_(i),a=g(e,r,3),u=P(s.length),c=0,f=p?m(t,u):h?m(t,0):void 0;c<u;c++)if((b||c in s)&&(o=a(n=s[c],c,i),l))if(p)f[c]=o;else if(o)switch(l){case 3:return!0;case 5:return n;case 6:return c;case 2:f.push(n)}else if(y)return!1;return v?-1:d||y?y:f}},et={}.propertyIsEnumerable,rt=Object.getOwnPropertyDescriptor,nt={f:rt&&!et.call({1:2},1)?function(t){var e=rt(this,t);return!!e&&e.enumerable}:et},ot=function(t){return _(O(t))},it={}.hasOwnProperty,st=function(t,e){return it.call(t,e)},at=Object.getOwnPropertyDescriptor,ut={f:L?at:function(t,e){if(t=ot(t),e=C(e,!0),D)try{return at(t,e)}catch(t){}if(st(t,e))return G(!nt.f.call(t,e),t[e])}},ct=V("native-function-to-string",Function.toString),ft=k.WeakMap,lt="function"==typeof ft&&/native code/.test(ct.call(ft)),pt=V("keys"),ht=function(t){return pt[t]||(pt[t]=$(t))},dt={},yt=k.WeakMap;if(lt){var vt=new yt,bt=vt.get,mt=vt.has,gt=vt.set;h=function(t,e){return gt.call(vt,t,e),e},d=function(t){return bt.call(vt,t)||{}},y=function(t){return mt.call(vt,t)}}else{var wt=ht("state");dt[wt]=!0,h=function(t,e){return z(t,wt,e),e},d=function(t){return st(t,wt)?t[wt]:{}},y=function(t){return st(t,wt)}}var _t,Ot={set:h,get:d,has:y,enforce:function(t){return y(t)?d(t):h(t,{})},getterFor:function(r){return function(t){var e;if(!x(t)||(e=d(t)).type!==r)throw TypeError("Incompatible receiver, "+r+" required");return e}}},St=e(function(t){var e=Ot.get,a=Ot.enforce,u=String(ct).split("toString");V("inspectSource",function(t){return ct.call(t)}),(t.exports=function(t,e,r,n){var o=!!n&&!!n.unsafe,i=!!n&&!!n.enumerable,s=!!n&&!!n.noTargetGet;"function"==typeof r&&("string"!=typeof e||st(r,"name")||z(r,"name",e),a(r).source=u.join("string"==typeof e?e:"")),t!==k?(o?!s&&t[e]&&(i=!0):delete t[e],i?t[e]=r:z(t,e,r)):i?t[e]=r:H(e,r)})(Function.prototype,"toString",function(){return"function"==typeof this&&e(this).source||ct.call(this)})}),At=Math.max,jt=Math.min,Et=(_t=!1,function(t,e,r){var n,o,i,s=ot(t),a=P(s.length),u=(n=a,(o=E(r))<0?At(o+n,0):jt(o,n));if(_t&&e!=e){for(;u<a;)if((i=s[u++])!=i)return!0}else for(;u<a;u++)if((_t||u in s)&&s[u]===e)return _t||u||0;return!_t&&-1}),Tt=function(t,e){var r,n=ot(t),o=0,i=[];for(r in n)!st(dt,r)&&st(n,r)&&i.push(r);for(;e.length>o;)st(n,r=e[o++])&&(~Et(i,r)||i.push(r));return i},Pt=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],xt=Pt.concat("length","prototype"),It={f:Object.getOwnPropertyNames||function(t){return Tt(t,xt)}},kt={f:Object.getOwnPropertySymbols},Lt=k.Reflect,Ft=Lt&&Lt.ownKeys||function(t){var e=It.f(B(t)),r=kt.f;return r?e.concat(r(t)):e},Nt=function(t,e){for(var r=Ft(e),n=U.f,o=ut.f,i=0;i<r.length;i++){var s=r[i];st(t,s)||n(t,s,o(e,s))}},Rt=/#|\.prototype\./,Dt=function(t,e){var r=Ct[Bt(t)];return r==Ut||r!=Mt&&("function"==typeof e?v(e):!!e)},Bt=Dt.normalize=function(t){return String(t).replace(Rt,".").toLowerCase()},Ct=Dt.data={},Mt=Dt.NATIVE="N",Ut=Dt.POLYFILL="P",Gt=Dt,zt=ut.f,Ht=function(t,e){var r,n,o,i,s,a=t.target,u=t.global,c=t.stat;if(r=u?k:c?k[a]||H(a,{}):(k[a]||{}).prototype)for(n in e){if(i=e[n],o=t.noTargetGet?(s=zt(r,n))&&s.value:r[n],!Gt(u?n:a+(c?".":"#")+n,t.forced)&&void 0!==o){if(typeof i==typeof o)continue;Nt(i,o)}(t.sham||o&&o.sham)&&z(i,"sham",!0),St(r,n,i,t)}},Vt=Object.keys||function(t){return Tt(t,Pt)},qt=L?Object.defineProperties:function(t,e){B(t);for(var r,n=Vt(e),o=n.length,i=0;i<o;)U.f(t,r=n[i++],e[r]);return t},Wt=k.document,$t=Wt&&Wt.documentElement,Jt=ht("IE_PROTO"),Kt="prototype",Yt=function(){},Xt=function(){var t,e=R("iframe"),r=Pt.length,n="script";for(e.style.display="none",$t.appendChild(e),e.src=String("javascript:"),(t=e.contentWindow.document).open(),t.write("<script>document.F=Object</"+n+">"),t.close(),Xt=t.F;r--;)delete Xt[Kt][Pt[r]];return Xt()},Qt=Object.create||function(t,e){var r;return null!==t?(Yt[Kt]=B(t),r=new Yt,Yt[Kt]=null,r[Jt]=t):r=Xt(),void 0===e?r:qt(r,e)};dt[Jt]=!0;var Zt=X("unscopables"),te=Array.prototype;null==te[Zt]&&z(te,Zt,Qt(null));var ee=function(t){te[Zt][t]=!0},re=tt(5),ne="find",oe=!0;ne in[]&&Array(1)[ne](function(){oe=!1}),Ht({target:"Array",proto:!0,forced:oe},{find:function(t){return re(this,t,1<arguments.length?arguments[1]:void 0)}}),ee(ne);var ie=Function.call,se=function(t,e,r){return g(ie,k[t].prototype[e],r)},ae=(se("Array","find"),tt(6)),ue="findIndex",ce=!0;ue in[]&&Array(1)[ue](function(){ce=!1}),Ht({target:"Array",proto:!0,forced:ce},{findIndex:function(t){return ae(this,t,1<arguments.length?arguments[1]:void 0)}}),ee(ue);se("Array","findIndex");var fe=Object.assign,le=!fe||v(function(){var t={},e={},r=Symbol(),n="abcdefghijklmnopqrst";return t[r]=7,n.split("").forEach(function(t){e[t]=t}),7!=fe({},t)[r]||Vt(fe({},e)).join("")!=n})?function(t,e){for(var r=S(t),n=arguments.length,o=1,i=kt.f,s=nt.f;o<n;)for(var a,u=_(arguments[o++]),c=i?Vt(u).concat(i(u)):Vt(u),f=c.length,l=0;l<f;)s.call(u,a=c[l++])&&(r[a]=u[a]);return r}:fe;Ht({target:"Object",stat:!0,forced:Object.assign!==le},{assign:le});var pe=k,he=(pe.Object.assign,X("match")),de=function(t,e,r){if(x(n=e)&&(void 0!==(o=n[he])?o:"RegExp"==m(n)))throw TypeError("String.prototype."+r+" doesn't accept regex");var n,o;return String(O(t))},ye=X("match"),ve="startsWith",be=function(e){var r=/./;try{"/./"[e](r)}catch(t){try{return r[ye]=!1,"/./"[e](r)}catch(t){}}return!1}(ve),me=""[ve];Ht({target:"String",proto:!0,forced:!be},{startsWith:function(t){var e=de(this,t,ve),r=P(Math.min(1<arguments.length?arguments[1]:void 0,e.length)),n=String(t);return me?me.call(e,n,r):e.slice(r,r+n.length)===n}});se("String","startsWith");Ht({target:"String",proto:!0},{repeat:"".repeat||function(t){var e=String(O(this)),r="",n=E(t);if(n<0||n==1/0)throw RangeError("Wrong number of repetitions");for(;0<n;(n>>>=1)&&(e+=e))1&n&&(r+=e);return r}});se("String","repeat");var ge,we=function(t,e,r){var n=C(e);n in t?U.f(t,n,G(0,r)):t[n]=r},_e=X("species"),Oe=X("isConcatSpreadable"),Se=9007199254740991,Ae="Maximum allowed index exceeded",je=!v(function(){var t=[];return t[Oe]=!1,t.concat()[0]!==t}),Ee=(ge="concat",!v(function(){var t=[];return(t.constructor={})[_e]=function(){return{foo:1}},1!==t[ge](Boolean).foo})),Te=function(t){if(!x(t))return!1;var e=t[Oe];return void 0!==e?!!e:I(t)};Ht({target:"Array",proto:!0,forced:!je||!Ee},{concat:function(t){var e,r,n,o,i,s=S(this),a=Z(s,0),u=0;for(e=-1,n=arguments.length;e<n;e++)if(i=-1===e?s:arguments[e],Te(i)){if(o=P(i.length),Se<u+o)throw TypeError(Ae);for(r=0;r<o;r++,u++)r in i&&we(a,u,i[r])}else{if(Se<=u)throw TypeError(Ae);we(a,u++,i)}return a.length=u,a}});var Pe=X("toStringTag"),xe="Arguments"==m(function(){return arguments}()),Ie={};Ie[X("toStringTag")]="z";var ke="[object z]"!==String(Ie)?function(){return"[object "+(void 0===(t=this)?"Undefined":null===t?"Null":"string"==typeof(r=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),Pe))?r:xe?m(e):"Object"==(n=m(e))&&"function"==typeof e.callee?"Arguments":n)+"]";var t,e,r,n}:Ie.toString,Le=Object.prototype;ke!==Le.toString&&St(Le,"toString",ke,{unsafe:!0});var Fe=U.f,Ne=X("toStringTag"),Re=function(t,e,r){t&&!st(t=r?t:t.prototype,Ne)&&Fe(t,Ne,{configurable:!0,value:e})},De={f:X},Be=U.f,Ce=function(t){var e=pe.Symbol||(pe.Symbol={});st(e,t)||Be(e,t,{value:De.f(t)})},Me=It.f,Ue={}.toString,Ge="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],ze={f:function(t){return Ge&&"[object Window]"==Ue.call(t)?function(t){try{return Me(t)}catch(t){return Ge.slice()}}(t):Me(ot(t))}},He=ht("hidden"),Ve="Symbol",qe=Ot.set,We=Ot.getterFor(Ve),$e=ut.f,Je=U.f,Ke=ze.f,Ye=k.Symbol,Xe=k.JSON,Qe=Xe&&Xe.stringify,Ze="prototype",tr=X("toPrimitive"),er=nt.f,rr=V("symbol-registry"),nr=V("symbols"),or=V("op-symbols"),ir=V("wks"),sr=Object[Ze],ar=k.QObject,ur=!ar||!ar[Ze]||!ar[Ze].findChild,cr=L&&v(function(){return 7!=Qt(Je({},"a",{get:function(){return Je(this,"a",{value:7}).a}})).a})?function(t,e,r){var n=$e(sr,e);n&&delete sr[e],Je(t,e,r),n&&t!==sr&&Je(sr,e,n)}:Je,fr=function(t,e){var r=nr[t]=Qt(Ye[Ze]);return qe(r,{type:Ve,tag:t,description:e}),L||(r.description=e),r},lr=J&&"symbol"==typeof Ye.iterator?function(t){return"symbol"==typeof t}:function(t){return Object(t)instanceof Ye},pr=function(t,e,r){return t===sr&&pr(or,e,r),B(t),e=C(e,!0),B(r),st(nr,e)?(r.enumerable?(st(t,He)&&t[He][e]&&(t[He][e]=!1),r=Qt(r,{enumerable:G(0,!1)})):(st(t,He)||Je(t,He,G(1,{})),t[He][e]=!0),cr(t,e,r)):Je(t,e,r)},hr=function(t,e){B(t);for(var r,n=function(t){var e=Vt(t),r=kt.f;if(r)for(var n,o=r(t),i=nt.f,s=0;o.length>s;)i.call(t,n=o[s++])&&e.push(n);return e}(e=ot(e)),o=0,i=n.length;o<i;)pr(t,r=n[o++],e[r]);return t},dr=function(t){var e=er.call(this,t=C(t,!0));return!(this===sr&&st(nr,t)&&!st(or,t))&&(!(e||!st(this,t)||!st(nr,t)||st(this,He)&&this[He][t])||e)},yr=function(t,e){if(t=ot(t),e=C(e,!0),t!==sr||!st(nr,e)||st(or,e)){var r=$e(t,e);return!r||!st(nr,e)||st(t,He)&&t[He][e]||(r.enumerable=!0),r}},vr=function(t){for(var e,r=Ke(ot(t)),n=[],o=0;r.length>o;)st(nr,e=r[o++])||st(dt,e)||n.push(e);return n},br=function(t){for(var e,r=t===sr,n=Ke(r?or:ot(t)),o=[],i=0;n.length>i;)!st(nr,e=n[i++])||r&&!st(sr,e)||o.push(nr[e]);return o};J||(St((Ye=function(){if(this instanceof Ye)throw TypeError("Symbol is not a constructor");var t=void 0===arguments[0]?void 0:String(arguments[0]),e=$(t),r=function(t){this===sr&&r.call(or,t),st(this,He)&&st(this[He],e)&&(this[He][e]=!1),cr(this,e,G(1,t))};return L&&ur&&cr(sr,e,{configurable:!0,set:r}),fr(e,t)})[Ze],"toString",function(){return We(this).tag}),nt.f=dr,U.f=pr,ut.f=yr,It.f=ze.f=vr,kt.f=br,L&&(Je(Ye[Ze],"description",{configurable:!0,get:function(){return We(this).description}}),St(sr,"propertyIsEnumerable",dr,{unsafe:!0})),De.f=function(t){return fr(X(t),t)}),Ht({global:!0,wrap:!0,forced:!J,sham:!J},{Symbol:Ye});for(var mr=Vt(ir),gr=0;mr.length>gr;)Ce(mr[gr++]);Ht({target:Ve,stat:!0,forced:!J},{for:function(t){return st(rr,t+="")?rr[t]:rr[t]=Ye(t)},keyFor:function(t){if(!lr(t))throw TypeError(t+" is not a symbol");for(var e in rr)if(rr[e]===t)return e},useSetter:function(){ur=!0},useSimple:function(){ur=!1}}),Ht({target:"Object",stat:!0,forced:!J,sham:!L},{create:function(t,e){return void 0===e?Qt(t):hr(Qt(t),e)},defineProperty:pr,defineProperties:hr,getOwnPropertyDescriptor:yr}),Ht({target:"Object",stat:!0,forced:!J},{getOwnPropertyNames:vr,getOwnPropertySymbols:br}),Xe&&Ht({target:"JSON",stat:!0,forced:!J||v(function(){var t=Ye();return"[null]"!=Qe([t])||"{}"!=Qe({a:t})||"{}"!=Qe(Object(t))})},{stringify:function(t){for(var e,r,n=[t],o=1;arguments.length>o;)n.push(arguments[o++]);if(r=e=n[1],(x(e)||void 0!==t)&&!lr(t))return I(e)||(e=function(t,e){if("function"==typeof r&&(e=r.call(this,t,e)),!lr(e))return e}),n[1]=e,Qe.apply(Xe,n)}}),Ye[Ze][tr]||z(Ye[Ze],tr,Ye[Ze].valueOf),Re(Ye,Ve),dt[He]=!0,Ce("asyncIterator");var wr=U.f,_r=k.Symbol;if(L&&"function"==typeof _r&&(!("description"in _r.prototype)||void 0!==_r().description)){var Or={},Sr=function(){var t=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),e=this instanceof Sr?new _r(t):void 0===t?_r():_r(t);return""===t&&(Or[e]=!0),e};Nt(Sr,_r);var Ar=Sr.prototype=_r.prototype;Ar.constructor=Sr;var jr=Ar.toString,Er="Symbol(test)"==String(_r("test")),Tr=/^Symbol\((.*)\)[^)]+$/;wr(Ar,"description",{configurable:!0,get:function(){var t=x(this)?this.valueOf():this,e=jr.call(t);if(st(Or,t))return"";var r=Er?e.slice(7,-1):e.replace(Tr,"$1");return""===r?void 0:r}}),Ht({global:!0,forced:!0},{Symbol:Sr})}Ce("hasInstance"),Ce("isConcatSpreadable"),Ce("iterator"),Ce("match"),Ce("replace"),Ce("search"),Ce("species"),Ce("split"),Ce("toPrimitive"),Ce("toStringTag"),Ce("unscopables"),Re(Math,"Math",!0),Re(k.JSON,"JSON",!0);pe.Symbol;Ce("dispose"),Ce("observable"),Ce("patternMatch");var Pr,xr,Ir,kr=!v(function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}),Lr=ht("IE_PROTO"),Fr=Object.prototype,Nr=kr?Object.getPrototypeOf:function(t){return t=S(t),st(t,Lr)?t[Lr]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?Fr:null},Rr=X("iterator"),Dr=!1;[].keys&&("next"in(Ir=[].keys())?(xr=Nr(Nr(Ir)))!==Object.prototype&&(Pr=xr):Dr=!0),null==Pr&&(Pr={}),st(Pr,Rr)||z(Pr,Rr,function(){return this});var Br={IteratorPrototype:Pr,BUGGY_SAFARI_ITERATORS:Dr},Cr=Br.IteratorPrototype,Mr=Object.setPrototypeOf||("__proto__"in{}?function(){var r,n=!1,t={};try{(r=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(t,[]),n=t instanceof Array}catch(t){}return function(t,e){return function(t,e){if(B(t),!x(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(t,e),n?r.call(t,e):t.__proto__=e,t}}():void 0),Ur=X("iterator"),Gr=Br.IteratorPrototype,zr=Br.BUGGY_SAFARI_ITERATORS,Hr="values",Vr="entries",qr=function(){return this},Wr=function(t,e,r,n,o,i,s){var a,u,c;u=n,c=e+" Iterator",(a=r).prototype=Qt(Cr,{next:G(1,u)}),Re(a,c,!1);var f,l,p,h=function(t){if(t===o&&m)return m;if(!zr&&t in v)return v[t];switch(t){case"keys":case Hr:case Vr:return function(){return new r(this,t)}}return function(){return new r(this)}},d=e+" Iterator",y=!1,v=t.prototype,b=v[Ur]||v["@@iterator"]||o&&v[o],m=!zr&&b||h(o),g="Array"==e&&v.entries||b;if(g&&(f=Nr(g.call(new t)),Gr!==Object.prototype&&f.next&&(Nr(f)!==Gr&&(Mr?Mr(f,Gr):"function"!=typeof f[Ur]&&z(f,Ur,qr)),Re(f,d,!0))),o==Hr&&b&&b.name!==Hr&&(y=!0,m=function(){return b.call(this)}),v[Ur]!==m&&z(v,Ur,m),o)if(l={values:h(Hr),keys:i?m:h("keys"),entries:h(Vr)},s)for(p in l)!zr&&!y&&p in v||St(v,p,l[p]);else Ht({target:e,proto:!0,forced:zr||y},l);return l},$r="String Iterator",Jr=Ot.set,Kr=Ot.getterFor($r);Wr(String,"String",function(t){Jr(this,{type:$r,string:String(t),index:0})},function(){var t,e,r,n,o,i,s,a,u=Kr(this),c=u.string,f=u.index;return f>=c.length?{value:void 0,done:!0}:(e=f,r=!0,i=String(O(c)),s=E(e),a=i.length,t=s<0||a<=s?r?"":void 0:(n=i.charCodeAt(s))<55296||56319<n||s+1===a||(o=i.charCodeAt(s+1))<56320||57343<o?r?i.charAt(s):n:r?i.slice(s,s+2):o-56320+(n-55296<<10)+65536,u.index+=t.length,{value:t,done:!1})});var Yr={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},Xr="Array Iterator",Qr=Ot.set,Zr=Ot.getterFor(Xr),tn=Wr(Array,"Array",function(t,e){Qr(this,{type:Xr,target:ot(t),index:0,kind:e})},function(){var t=Zr(this),e=t.target,r=t.kind,n=t.index++;return!e||n>=e.length?{value:t.target=void 0,done:!0}:"keys"==r?{value:n,done:!1}:"values"==r?{value:e[n],done:!1}:{value:[n,e[n]],done:!1}},"values");ee("keys"),ee("values"),ee("entries");var en=X("iterator"),rn=X("toStringTag"),nn=tn.values;for(var on in Yr){var sn=k[on],an=sn&&sn.prototype;if(an){if(an[en]!==nn)try{z(an,en,nn)}catch(_n){an[en]=nn}if(an[rn]||z(an,rn,on),Yr[on])for(var un in tn)if(an[un]!==tn[un])try{z(an,un,tn[un])}catch(_n){an[un]=tn[un]}}}De.f("iterator");function cn(t,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:return new Date(e.getTime());case Object:void 0===t&&(t={});break;case Array:t=[];break;default:return e}for(var r in e)e.hasOwnProperty(r)&&(t[r]=cn(t[r],e[r]));return t}function fn(t,e,r){t[e]=r}var ln="FirebaseError",pn=Error.captureStackTrace,hn=function(t,e){if(this.code=t,this.message=e,pn)pn(this,dn.prototype.create);else try{throw Error.apply(this,arguments)}catch(t){this.name=ln,Object.defineProperty(this,"stack",{get:function(){return t.stack}})}};hn.prototype=Object.create(Error.prototype),(hn.prototype.constructor=hn).prototype.name=ln;var dn=function(){function t(t,e,r){this.service=t,this.serviceName=e,this.errors=r,this.pattern=/\{\$([^}]+)}/g}return t.prototype.create=function(t,n){void 0===n&&(n={});var e,r=this.errors[t],o=this.service+"/"+t;e=void 0===r?"Error":r.replace(this.pattern,function(t,e){var r=n[e];return void 0!==r?r.toString():"<"+e+"?>"}),e=this.serviceName+": "+e+" ("+o+").";var i=new hn(o,e);for(var s in n)n.hasOwnProperty(s)&&"_"!==s.slice(-1)&&(i[s]=n[s]);return i},t}();function yn(t,e){var r=new bn(t,e);return r.subscribe.bind(r)}var vn,bn=function(){function t(t,e){var r=this;this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then(function(){t(r)}).catch(function(t){r.error(t)})}return t.prototype.next=function(e){this.forEachObserver(function(t){t.next(e)})},t.prototype.error=function(e){this.forEachObserver(function(t){t.error(e)}),this.close(e)},t.prototype.complete=function(){this.forEachObserver(function(t){t.complete()}),this.close()},t.prototype.subscribe=function(t,e,r){var n,o=this;if(void 0===t&&void 0===e&&void 0===r)throw new Error("Missing Observer.");void 0===(n=function(t,e){if("object"!=typeof t||null===t)return!1;for(var r=0,n=e;r<n.length;r++){var o=n[r];if(o in t&&"function"==typeof t[o])return!0}return!1}(t,["next","error","complete"])?t:{next:t,error:e,complete:r}).next&&(n.next=mn),void 0===n.error&&(n.error=mn),void 0===n.complete&&(n.complete=mn);var i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(function(){try{o.finalError?n.error(o.finalError):n.complete()}catch(t){}}),this.observers.push(n),i},t.prototype.unsubscribeOne=function(t){void 0!==this.observers&&void 0!==this.observers[t]&&(delete this.observers[t],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))},t.prototype.forEachObserver=function(t){if(!this.finalized)for(var e=0;e<this.observers.length;e++)this.sendOne(e,t)},t.prototype.sendOne=function(t,e){var r=this;this.task.then(function(){if(void 0!==r.observers&&void 0!==r.observers[t])try{e(r.observers[t])}catch(t){"undefined"!=typeof console&&console.error&&console.error(t)}})},t.prototype.close=function(t){var e=this;this.finalized||(this.finalized=!0,void 0!==t&&(this.finalError=t),this.task.then(function(){e.observers=void 0,e.onNoObservers=void 0}))},t}();function mn(){}var gn=((vn={})["no-app"]="No Firebase App '{$name}' has been created - call Firebase App.initializeApp()",vn["bad-app-name"]="Illegal App name: '{$name}",vn["duplicate-app"]="Firebase App named '{$name}' already exists",vn["app-deleted"]="Firebase App named '{$name}' already deleted",vn["duplicate-service"]="Firebase service named '{$name}' already registered",vn["invalid-app-argument"]="firebase.{$name}() takes either no argument or a Firebase App instance.",vn),wn=new dn("app","Firebase",gn);function _n(t,e){throw wn.create(t,e)}var On="[DEFAULT]",Sn=[],An=function(){function t(t,e,r){this.firebase_=r,this.isDeleted_=!1,this.services_={},this.name_=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled||!1,this.options_=cn(void 0,t),this.INTERNAL={getUid:function(){return null},getToken:function(){return Promise.resolve(null)},addAuthTokenListener:function(t){Sn.push(t),setTimeout(function(){return t(null)},0)},removeAuthTokenListener:function(e){Sn=Sn.filter(function(t){return t!==e})}}}return Object.defineProperty(t.prototype,"automaticDataCollectionEnabled",{get:function(){return this.checkDestroyed_(),this._automaticDataCollectionEnabled},set:function(t){this.checkDestroyed_(),this._automaticDataCollectionEnabled=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"name",{get:function(){return this.checkDestroyed_(),this.name_},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"options",{get:function(){return this.checkDestroyed_(),this.options_},enumerable:!0,configurable:!0}),t.prototype.delete=function(){var n=this;return new Promise(function(t){n.checkDestroyed_(),t()}).then(function(){n.firebase_.INTERNAL.removeApp(n.name_);var r=[];return Object.keys(n.services_).forEach(function(e){Object.keys(n.services_[e]).forEach(function(t){r.push(n.services_[e][t])})}),Promise.all(r.map(function(t){return t.INTERNAL.delete()}))}).then(function(){n.isDeleted_=!0,n.services_={}})},t.prototype._getService=function(t,e){if(void 0===e&&(e=On),this.checkDestroyed_(),this.services_[t]||(this.services_[t]={}),!this.services_[t][e]){var r=e!==On?e:void 0,n=this.firebase_.INTERNAL.factories[t](this,this.extendApp.bind(this),r);this.services_[t][e]=n}return this.services_[t][e]},t.prototype.extendApp=function(t){var e=this;cn(this,t),t.INTERNAL&&t.INTERNAL.addAuthTokenListener&&(Sn.forEach(function(t){e.INTERNAL.addAuthTokenListener(t)}),Sn=[])},t.prototype.checkDestroyed_=function(){this.isDeleted_&&_n("app-deleted",{name:this.name_})},t}();An.prototype.name&&An.prototype.options||An.prototype.delete||console.log("dc");var jn=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};var En=!1;try{En="[object process]"===Object.prototype.toString.call(global.process)}catch(t){}return En&&console.warn('\nWarning: This is a browser-targeted Firebase bundle but it appears it is being\nrun in a Node environment.  If running in a Node environment, make sure you\nare using the bundle specified by the "main" field in package.json.\n\nIf you are using Webpack, you can specify "main" as the first item in\n"resolve.mainFields":\nhttps://webpack.js.org/configuration/resolve/#resolvemainfields\n\nIf using Rollup, use the rollup-plugin-node-resolve plugin and set "module"\nto false and "main" to true:\nhttps://github.com/rollup/rollup-plugin-node-resolve\n'),function t(){var s={},a={},u={},c={__esModule:!0,initializeApp:function(t,e){if(void 0===e&&(e={}),"object"!=typeof e||null===e){var r=e;e={name:r}}var n=e;void 0===n.name&&(n.name=On);var o=n.name;"string"==typeof o&&o||_n("bad-app-name",{name:o+""}),jn(s,o)&&_n("duplicate-app",{name:o});var i=new An(t,n,c);return p(s[o]=i,"create"),i},app:f,apps:null,Promise:Promise,SDK_VERSION:"5.10.1",INTERNAL:{registerService:function(r,t,e,n,o){a[r]&&_n("duplicate-service",{name:r}),a[r]=t,n&&(u[r]=n,l().forEach(function(t){n("create",t)}));var i=function(t){return void 0===t&&(t=f()),"function"!=typeof t[r]&&_n("invalid-app-argument",{name:r}),t[r]()};return void 0!==e&&cn(i,e),c[r]=i,An.prototype[r]=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];return this._getService.bind(this,r).apply(this,o?t:[])},i},createFirebaseNamespace:t,extendNamespace:function(t){cn(c,t)},createSubscribe:yn,ErrorFactory:dn,removeApp:function(t){p(s[t],"delete"),delete s[t]},factories:a,useAsService:o,Promise:Promise,deepExtend:cn}};function f(t){return jn(s,t=t||On)||_n("no-app",{name:t}),s[t]}function l(){return Object.keys(s).map(function(t){return s[t]})}function p(r,n){Object.keys(a).forEach(function(t){var e=o(r,t);null!==e&&u[e]&&u[e](n,r)})}function o(t,e){if("serverAuth"===e)return null;var r=e;return t.options,r}return fn(c,"default",c),Object.defineProperty(c,"apps",{get:l}),fn(f,"App",An),c}()});
// [hashtag] sourceMappingURL=firebase-app.js.map
