/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: iframeResizer.js on host page.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 */
(function () {
  'use strict';
  var autoResize = true, base = 10, bodyBackground = '', bodyMargin = 0, bodyMarginStr = '', bodyPadding = '', calculateWidth = false, height = 1, firstRun = true, heightCalcModeDefault = 'offset', heightCalcMode = heightCalcModeDefault, interval = 32, lastTrigger = '', logging = false, msgID = '[iFrameSizer]',
    //Must match host page msg ID
    msgIdLen = msgID.length, myID = '', publicMethods = false, targetOriginDefault = '*', target = window.parent, triggerCancelTimer = 50, width = 1;
  function addEventListener(e, func) {
    if ('addEventListener' in window) {
      window.addEventListener(e, func, false);
    } else if ('attachEvent' in window) {
      //IE
      window.attachEvent('on' + e, func);
    }
  }
  function formatLogMsg(msg) {
    return msgID + '[' + myID + ']' + ' ' + msg;
  }
  function log(msg) {
    if (logging && 'console' in window) {
      console.log(formatLogMsg(msg));
    }
  }
  function warn(msg) {
    if ('console' in window) {
      console.warn(formatLogMsg(msg));
    }
  }
  function receiver(event) {
    function init() {
      log('Initialising iFrame');
      readData();
      setMargin();
      setBodyStyle('background', bodyBackground);
      setBodyStyle('padding', bodyPadding);
      injectClearFixIntoBodyElement();
      checkHeightMode();
      stopInfiniteResizingOfIFrame();
      setupPublicMethods();
      startEventListeners();
    }
    function readData() {
      var data = event.data.substr(msgIdLen).split(':');
      function strBool(str) {
        return 'true' === str ? true : false;
      }
      myID = data[0];
      bodyMargin = undefined !== data[1] ? parseInt(data[1], base) : bodyMargin;
      //For V1 compatibility
      calculateWidth = undefined !== data[2] ? strBool(data[2]) : calculateWidth;
      logging = undefined !== data[3] ? strBool(data[3]) : logging;
      interval = undefined !== data[4] ? parseInt(data[4], base) : interval;
      publicMethods = undefined !== data[5] ? strBool(data[5]) : publicMethods;
      autoResize = undefined !== data[6] ? strBool(data[6]) : autoResize;
      bodyMarginStr = data[7];
      heightCalcMode = undefined !== data[8] ? data[8] : heightCalcMode;
      bodyBackground = data[9];
      bodyPadding = data[10];
    }
    function chkCSS(attr, value) {
      if (-1 !== value.indexOf('-')) {
        warn('Negative CSS value ignored for ' + attr);
        value = '';
      }
      return value;
    }
    function setBodyStyle(attr, value) {
      if (undefined !== value && '' !== value && 'null' !== value) {
        document.body.style[attr] = value;
        log('Body ' + attr + ' set to "' + value + '"');
      }
    }
    function setMargin() {
      //If called via V1 script, convert bodyMargin from int to str 
      if (undefined === bodyMarginStr) {
        bodyMarginStr = bodyMargin + 'px';
      }
      chkCSS('margin', bodyMarginStr);
      setBodyStyle('margin', bodyMarginStr);
    }
    function stopInfiniteResizingOfIFrame() {
      document.documentElement.style.height = 'auto';
      document.body.style.height = 'auto';
      log('HTML & body height set to "auto"');
    }
    function initWindowResizeListener() {
      addEventListener('resize', function () {
        sendSize('resize', 'Window resized');
      });
    }
    function initWindowClickListener() {
      addEventListener('click', function () {
        sendSize('click', 'Window clicked');
      });
    }
    function checkHeightMode() {
      if (heightCalcModeDefault !== heightCalcMode) {
        if (!(heightCalcMode in getHeight)) {
          warn(heightCalcMode + ' is not a valid option for heightCalculationMethod.');
          heightCalcMode = 'bodyScroll';
        }
        log('Height calculation method set to "' + heightCalcMode + '"');
      }
    }
    function startEventListeners() {
      if (true === autoResize) {
        initWindowResizeListener();
        initWindowClickListener();
        setupMutationObserver();
      } else {
        log('Auto Resize disabled');
      }
    }
    function injectClearFixIntoBodyElement() {
      var clearFix = document.createElement('div');
      clearFix.style.clear = 'both';
      clearFix.style.display = 'block';
      //Guard against this having been globally redefined in CSS.
      document.body.appendChild(clearFix);
    }
    function setupPublicMethods() {
      if (publicMethods) {
        log('Enable public methods');
        window.parentIFrame = {
          close: function closeF() {
            sendSize('close', 'window.parentIFrame.close()', 0, 0);
          },
          getId: function getIdF() {
            return myID;
          },
          sendMessage: function sendMessageF(msg, targetOrigin) {
            sendMsg(0, 0, 'message', msg, targetOrigin);
          },
          setHeightCalculationMethod: function setHeightCalculationMethodF(heightCalculationMethod) {
            heightCalcMode = heightCalculationMethod;
            checkHeightMode();
          },
          setTargetOrigin: function setTargetOriginF(targetOrigin) {
            log('Set targetOrigin: ' + targetOrigin);
            targetOriginDefault = targetOrigin;
          },
          size: function sizeF(customHeight, customWidth) {
            var valString = '' + (customHeight ? customHeight : '') + (customWidth ? ',' + customWidth : '');
            sendSize('size', 'window.parentIFrame.size(' + valString + ')', customHeight, customWidth);
          }
        };
      }
    }
    function initInterval() {
      if (0 !== interval) {
        log('setInterval: ' + interval + 'ms');
        setInterval(function () {
          sendSize('interval', 'setInterval: ' + interval);
        }, Math.abs(interval));
      }
    }
    function setupMutationObserver() {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      function createMutationObserver() {
        var target = document.querySelector('body'), config = {
            attributes: true,
            attributeOldValue: false,
            characterData: true,
            characterDataOldValue: false,
            childList: true,
            subtree: true
          }, observer = new MutationObserver(function (mutations) {
            sendSize('mutationObserver', 'mutationObserver: ' + mutations[0].target + ' ' + mutations[0].type);
          });
        log('Enable MutationObserver');
        observer.observe(target, config);
      }
      if (MutationObserver) {
        if (0 > interval) {
          initInterval();
        } else {
          createMutationObserver();
        }
      } else {
        //warn('MutationObserver not supported in this browser!');
        initInterval();
      }
    }
    // document.documentElement.offsetHeight is not reliable, so
    // we have to jump through hoops to get a better value.
    function getBodyOffsetHeight() {
      function getComputedBodyStyle(prop) {
        function convertUnitsToPxForIE8(value) {
          var PIXEL = /^\d+(px)?$/i;
          if (PIXEL.test(value)) {
            return parseInt(value, base);
          }
          var style = el.style.left, runtimeStyle = el.runtimeStyle.left;
          el.runtimeStyle.left = el.currentStyle.left;
          el.style.left = value || 0;
          value = el.style.pixelLeft;
          el.style.left = style;
          el.runtimeStyle.left = runtimeStyle;
          return value;
        }
        var el = document.body, retVal = 0;
        if (document.defaultView && document.defaultView.getComputedStyle) {
          retVal = document.defaultView.getComputedStyle(el, null)[prop];
        } else {
          //IE8
          retVal = convertUnitsToPxForIE8(el.currentStyle[prop]);
        }
        return parseInt(retVal, base);
      }
      return document.body.offsetHeight + getComputedBodyStyle('marginTop') + getComputedBodyStyle('marginBottom');
    }
    function getBodyScrollHeight() {
      return document.body.scrollHeight;
    }
    function getDEOffsetHeight() {
      return document.documentElement.offsetHeight;
    }
    function getDEScrollHeight() {
      return document.documentElement.scrollHeight;
    }
    function getAllHeights() {
      return [
        getBodyOffsetHeight(),
        getBodyScrollHeight(),
        getDEOffsetHeight(),
        getDEScrollHeight()
      ];
    }
    function getMaxHeight() {
      return Math.max.apply(null, getAllHeights());
    }
    function getMinHeight() {
      return Math.min.apply(null, getAllHeights());
    }
    var getHeight = {
        offset: getBodyOffsetHeight,
        bodyOffset: getBodyOffsetHeight,
        bodyScroll: getBodyScrollHeight,
        documentElementOffset: getDEOffsetHeight,
        scroll: getDEScrollHeight,
        documentElementScroll: getDEScrollHeight,
        max: getMaxHeight,
        min: getMinHeight
      };
    function getWidth() {
      return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    }
    function sendSize(type, calleeMsg, customHeight, customWidth) {
      var currentHeight = undefined !== customHeight ? customHeight : getHeight[heightCalcMode](), currentWidth = undefined !== customWidth ? customWidth : getWidth();
      function cancelTrigger() {
        log('Trigger event (' + calleeMsg + ') cancelled');
        setTimeout(function () {
          lastTrigger = type;
        }, triggerCancelTimer);
      }
      function recordTrigger() {
        log('Trigger event: ' + calleeMsg);
        lastTrigger = type;
      }
      function resizeIFrame() {
        height = currentHeight;
        width = currentWidth;
        recordTrigger();
        sendMsg(height, width, type);
      }
      if ('interval' === lastTrigger && 'resize' === type) {
        //Prevent double resize
        cancelTrigger();
      } else if ('size' === lastTrigger && type in {
          resize: 1,
          click: 1
        }) {
        //Stop double trigger overridig size event
        cancelTrigger();
      } else if (height !== currentHeight || calculateWidth && width !== currentWidth) {
        resizeIFrame();
      }
    }
    function sendMsg(height, width, type, msg, targetOrigin) {
      function setTargetOrigin() {
        if (undefined === targetOrigin) {
          targetOrigin = targetOriginDefault;
        } else {
          log('Message targetOrigin: ' + targetOrigin);
        }
      }
      function sendToParent() {
        var message = myID + ':' + height + ':' + width + ':' + type + (undefined !== msg ? ':' + msg : '');
        log('Sending message to host page (' + message + ')');
        target.postMessage(msgID + message, targetOrigin);
      }
      setTargetOrigin();
      sendToParent();
    }
    function isMessageForUs() {
      return msgID === '' + event.data.substr(0, msgIdLen);
    }
    if (isMessageForUs() && firstRun) {
      //Check msg ID
      init();
      sendSize('init', 'Init message from host page');
      firstRun = false;
    }
  }
  addEventListener('message', receiver);
}());
/*
SWFObject v2.2 <http://code.google.com/p/swfobject/> 
is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
;
var swfobject = function () {
    var D = 'undefined', r = 'object', S = 'Shockwave Flash', W = 'ShockwaveFlash.ShockwaveFlash', q = 'application/x-shockwave-flash', R = 'SWFObjectExprInst', x = 'onreadystatechange', O = window, j = document, t = navigator, T = false, U = [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function () {
        var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, '$1')) : false, X = !+'\x0B1', ag = [
            0,
            0,
            0
          ], ab = null;
        if (typeof t.plugins != D && typeof t.plugins[S] == r) {
          ab = t.plugins[S].description;
          if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
            T = true;
            X = false;
            ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, '$1');
            ag[0] = parseInt(ab.replace(/^(.*)\..*$/, '$1'), 10);
            ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, '$1'), 10);
            ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, '$1'), 10) : 0;
          }
        } else {
          if (typeof O.ActiveXObject != D) {
            try {
              var ad = new ActiveXObject(W);
              if (ad) {
                ab = ad.GetVariable('$version');
                if (ab) {
                  X = true;
                  ab = ab.split(' ')[1].split(',');
                  ag = [
                    parseInt(ab[0], 10),
                    parseInt(ab[1], 10),
                    parseInt(ab[2], 10)
                  ];
                }
              }
            } catch (Z) {
            }
          }
        }
        return {
          w3: aa,
          pv: ag,
          wk: af,
          ie: X,
          win: ae,
          mac: ac
        };
      }(), k = function () {
        if (!M.w3) {
          return;
        }
        if (typeof j.readyState != D && j.readyState == 'complete' || typeof j.readyState == D && (j.getElementsByTagName('body')[0] || j.body)) {
          f();
        }
        if (!J) {
          if (typeof j.addEventListener != D) {
            j.addEventListener('DOMContentLoaded', f, false);
          }
          if (M.ie && M.win) {
            j.attachEvent(x, function () {
              if (j.readyState == 'complete') {
                j.detachEvent(x, arguments.callee);
                f();
              }
            });
            if (O == top) {
              (function () {
                if (J) {
                  return;
                }
                try {
                  j.documentElement.doScroll('left');
                } catch (X) {
                  setTimeout(arguments.callee, 0);
                  return;
                }
                f();
              }());
            }
          }
          if (M.wk) {
            (function () {
              if (J) {
                return;
              }
              if (!/loaded|complete/.test(j.readyState)) {
                setTimeout(arguments.callee, 0);
                return;
              }
              f();
            }());
          }
          s(f);
        }
      }();
    function f() {
      if (J) {
        return;
      }
      try {
        var Z = j.getElementsByTagName('body')[0].appendChild(C('span'));
        Z.parentNode.removeChild(Z);
      } catch (aa) {
        return;
      }
      J = true;
      var X = U.length;
      for (var Y = 0; Y < X; Y++) {
        U[Y]();
      }
    }
    function K(X) {
      if (J) {
        X();
      } else {
        U[U.length] = X;
      }
    }
    function s(Y) {
      if (typeof O.addEventListener != D) {
        O.addEventListener('load', Y, false);
      } else {
        if (typeof j.addEventListener != D) {
          j.addEventListener('load', Y, false);
        } else {
          if (typeof O.attachEvent != D) {
            i(O, 'onload', Y);
          } else {
            if (typeof O.onload == 'function') {
              var X = O.onload;
              O.onload = function () {
                X();
                Y();
              };
            } else {
              O.onload = Y;
            }
          }
        }
      }
    }
    function h() {
      if (T) {
        V();
      } else {
        H();
      }
    }
    function V() {
      var X = j.getElementsByTagName('body')[0];
      var aa = C(r);
      aa.setAttribute('type', q);
      var Z = X.appendChild(aa);
      if (Z) {
        var Y = 0;
        (function () {
          if (typeof Z.GetVariable != D) {
            var ab = Z.GetVariable('$version');
            if (ab) {
              ab = ab.split(' ')[1].split(',');
              M.pv = [
                parseInt(ab[0], 10),
                parseInt(ab[1], 10),
                parseInt(ab[2], 10)
              ];
            }
          } else {
            if (Y < 10) {
              Y++;
              setTimeout(arguments.callee, 10);
              return;
            }
          }
          X.removeChild(aa);
          Z = null;
          H();
        }());
      } else {
        H();
      }
    }
    function H() {
      var ag = o.length;
      if (ag > 0) {
        for (var af = 0; af < ag; af++) {
          var Y = o[af].id;
          var ab = o[af].callbackFn;
          var aa = {
              success: false,
              id: Y
            };
          if (M.pv[0] > 0) {
            var ae = c(Y);
            if (ae) {
              if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                w(Y, true);
                if (ab) {
                  aa.success = true;
                  aa.ref = z(Y);
                  ab(aa);
                }
              } else {
                if (o[af].expressInstall && A()) {
                  var ai = {};
                  ai.data = o[af].expressInstall;
                  ai.width = ae.getAttribute('width') || '0';
                  ai.height = ae.getAttribute('height') || '0';
                  if (ae.getAttribute('class')) {
                    ai.styleclass = ae.getAttribute('class');
                  }
                  if (ae.getAttribute('align')) {
                    ai.align = ae.getAttribute('align');
                  }
                  var ah = {};
                  var X = ae.getElementsByTagName('param');
                  var ac = X.length;
                  for (var ad = 0; ad < ac; ad++) {
                    if (X[ad].getAttribute('name').toLowerCase() != 'movie') {
                      ah[X[ad].getAttribute('name')] = X[ad].getAttribute('value');
                    }
                  }
                  P(ai, ah, Y, ab);
                } else {
                  p(ae);
                  if (ab) {
                    ab(aa);
                  }
                }
              }
            }
          } else {
            w(Y, true);
            if (ab) {
              var Z = z(Y);
              if (Z && typeof Z.SetVariable != D) {
                aa.success = true;
                aa.ref = Z;
              }
              ab(aa);
            }
          }
        }
      }
    }
    function z(aa) {
      var X = null;
      var Y = c(aa);
      if (Y && Y.nodeName == 'OBJECT') {
        if (typeof Y.SetVariable != D) {
          X = Y;
        } else {
          var Z = Y.getElementsByTagName(r)[0];
          if (Z) {
            X = Z;
          }
        }
      }
      return X;
    }
    function A() {
      return !a && F('6.0.65') && (M.win || M.mac) && !(M.wk && M.wk < 312);
    }
    function P(aa, ab, X, Z) {
      a = true;
      E = Z || null;
      B = {
        success: false,
        id: X
      };
      var ae = c(X);
      if (ae) {
        if (ae.nodeName == 'OBJECT') {
          l = g(ae);
          Q = null;
        } else {
          l = ae;
          Q = X;
        }
        aa.id = R;
        if (typeof aa.width == D || !/%$/.test(aa.width) && parseInt(aa.width, 10) < 310) {
          aa.width = '310';
        }
        if (typeof aa.height == D || !/%$/.test(aa.height) && parseInt(aa.height, 10) < 137) {
          aa.height = '137';
        }
        j.title = j.title.slice(0, 47) + ' - Flash Player Installation';
        var ad = M.ie && M.win ? 'ActiveX' : 'PlugIn', ac = 'MMredirectURL=' + O.location.toString().replace(/&/g, '%26') + '&MMplayerType=' + ad + '&MMdoctitle=' + j.title;
        if (typeof ab.flashvars != D) {
          ab.flashvars += '&' + ac;
        } else {
          ab.flashvars = ac;
        }
        if (M.ie && M.win && ae.readyState != 4) {
          var Y = C('div');
          X += 'SWFObjectNew';
          Y.setAttribute('id', X);
          ae.parentNode.insertBefore(Y, ae);
          ae.style.display = 'none';
          (function () {
            if (ae.readyState == 4) {
              ae.parentNode.removeChild(ae);
            } else {
              setTimeout(arguments.callee, 10);
            }
          }());
        }
        u(aa, ab, X);
      }
    }
    function p(Y) {
      if (M.ie && M.win && Y.readyState != 4) {
        var X = C('div');
        Y.parentNode.insertBefore(X, Y);
        X.parentNode.replaceChild(g(Y), X);
        Y.style.display = 'none';
        (function () {
          if (Y.readyState == 4) {
            Y.parentNode.removeChild(Y);
          } else {
            setTimeout(arguments.callee, 10);
          }
        }());
      } else {
        Y.parentNode.replaceChild(g(Y), Y);
      }
    }
    function g(ab) {
      var aa = C('div');
      if (M.win && M.ie) {
        aa.innerHTML = ab.innerHTML;
      } else {
        var Y = ab.getElementsByTagName(r)[0];
        if (Y) {
          var ad = Y.childNodes;
          if (ad) {
            var X = ad.length;
            for (var Z = 0; Z < X; Z++) {
              if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == 'PARAM') && !(ad[Z].nodeType == 8)) {
                aa.appendChild(ad[Z].cloneNode(true));
              }
            }
          }
        }
      }
      return aa;
    }
    function u(ai, ag, Y) {
      var X, aa = c(Y);
      if (M.wk && M.wk < 312) {
        return X;
      }
      if (aa) {
        if (typeof ai.id == D) {
          ai.id = Y;
        }
        if (M.ie && M.win) {
          var ah = '';
          for (var ae in ai) {
            if (ai[ae] != Object.prototype[ae]) {
              if (ae.toLowerCase() == 'data') {
                ag.movie = ai[ae];
              } else {
                if (ae.toLowerCase() == 'styleclass') {
                  ah += ' class="' + ai[ae] + '"';
                } else {
                  if (ae.toLowerCase() != 'classid') {
                    ah += ' ' + ae + '="' + ai[ae] + '"';
                  }
                }
              }
            }
          }
          var af = '';
          for (var ad in ag) {
            if (ag[ad] != Object.prototype[ad]) {
              af += '<param name="' + ad + '" value="' + ag[ad] + '" />';
            }
          }
          aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + '>' + af + '</object>';
          N[N.length] = ai.id;
          X = c(ai.id);
        } else {
          var Z = C(r);
          Z.setAttribute('type', q);
          for (var ac in ai) {
            if (ai[ac] != Object.prototype[ac]) {
              if (ac.toLowerCase() == 'styleclass') {
                Z.setAttribute('class', ai[ac]);
              } else {
                if (ac.toLowerCase() != 'classid') {
                  Z.setAttribute(ac, ai[ac]);
                }
              }
            }
          }
          for (var ab in ag) {
            if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != 'movie') {
              e(Z, ab, ag[ab]);
            }
          }
          aa.parentNode.replaceChild(Z, aa);
          X = Z;
        }
      }
      return X;
    }
    function e(Z, X, Y) {
      var aa = C('param');
      aa.setAttribute('name', X);
      aa.setAttribute('value', Y);
      Z.appendChild(aa);
    }
    function y(Y) {
      var X = c(Y);
      if (X && X.nodeName == 'OBJECT') {
        if (M.ie && M.win) {
          X.style.display = 'none';
          (function () {
            if (X.readyState == 4) {
              b(Y);
            } else {
              setTimeout(arguments.callee, 10);
            }
          }());
        } else {
          X.parentNode.removeChild(X);
        }
      }
    }
    function b(Z) {
      var Y = c(Z);
      if (Y) {
        for (var X in Y) {
          if (typeof Y[X] == 'function') {
            Y[X] = null;
          }
        }
        Y.parentNode.removeChild(Y);
      }
    }
    function c(Z) {
      var X = null;
      try {
        X = j.getElementById(Z);
      } catch (Y) {
      }
      return X;
    }
    function C(X) {
      return j.createElement(X);
    }
    function i(Z, X, Y) {
      Z.attachEvent(X, Y);
      I[I.length] = [
        Z,
        X,
        Y
      ];
    }
    function F(Z) {
      var Y = M.pv, X = Z.split('.');
      X[0] = parseInt(X[0], 10);
      X[1] = parseInt(X[1], 10) || 0;
      X[2] = parseInt(X[2], 10) || 0;
      return Y[0] > X[0] || Y[0] == X[0] && Y[1] > X[1] || Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2] ? true : false;
    }
    function v(ac, Y, ad, ab) {
      if (M.ie && M.mac) {
        return;
      }
      var aa = j.getElementsByTagName('head')[0];
      if (!aa) {
        return;
      }
      var X = ad && typeof ad == 'string' ? ad : 'screen';
      if (ab) {
        n = null;
        G = null;
      }
      if (!n || G != X) {
        var Z = C('style');
        Z.setAttribute('type', 'text/css');
        Z.setAttribute('media', X);
        n = aa.appendChild(Z);
        if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
          n = j.styleSheets[j.styleSheets.length - 1];
        }
        G = X;
      }
      if (M.ie && M.win) {
        if (n && typeof n.addRule == r) {
          n.addRule(ac, Y);
        }
      } else {
        if (n && typeof j.createTextNode != D) {
          n.appendChild(j.createTextNode(ac + ' {' + Y + '}'));
        }
      }
    }
    function w(Z, X) {
      if (!m) {
        return;
      }
      var Y = X ? 'visible' : 'hidden';
      if (J && c(Z)) {
        c(Z).style.visibility = Y;
      } else {
        v('#' + Z, 'visibility:' + Y);
      }
    }
    function L(Y) {
      var Z = /[\\\"<>\.;]/;
      var X = Z.exec(Y) != null;
      return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y;
    }
    var d = function () {
        if (M.ie && M.win) {
          window.attachEvent('onunload', function () {
            var ac = I.length;
            for (var ab = 0; ab < ac; ab++) {
              I[ab][0].detachEvent(I[ab][1], I[ab][2]);
            }
            var Z = N.length;
            for (var aa = 0; aa < Z; aa++) {
              y(N[aa]);
            }
            for (var Y in M) {
              M[Y] = null;
            }
            M = null;
            for (var X in swfobject) {
              swfobject[X] = null;
            }
            swfobject = null;
          });
        }
      }();
    return {
      registerObject: function (ab, X, aa, Z) {
        if (M.w3 && ab && X) {
          var Y = {};
          Y.id = ab;
          Y.swfVersion = X;
          Y.expressInstall = aa;
          Y.callbackFn = Z;
          o[o.length] = Y;
          w(ab, false);
        } else {
          if (Z) {
            Z({
              success: false,
              id: ab
            });
          }
        }
      },
      getObjectById: function (X) {
        if (M.w3) {
          return z(X);
        }
      },
      embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
        var X = {
            success: false,
            id: ah
          };
        if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
          w(ah, false);
          K(function () {
            ae += '';
            ag += '';
            var aj = {};
            if (af && typeof af === r) {
              for (var al in af) {
                aj[al] = af[al];
              }
            }
            aj.data = ab;
            aj.width = ae;
            aj.height = ag;
            var am = {};
            if (ad && typeof ad === r) {
              for (var ak in ad) {
                am[ak] = ad[ak];
              }
            }
            if (Z && typeof Z === r) {
              for (var ai in Z) {
                if (typeof am.flashvars != D) {
                  am.flashvars += '&' + ai + '=' + Z[ai];
                } else {
                  am.flashvars = ai + '=' + Z[ai];
                }
              }
            }
            if (F(Y)) {
              var an = u(aj, am, ah);
              if (aj.id == ah) {
                w(ah, true);
              }
              X.success = true;
              X.ref = an;
            } else {
              if (aa && A()) {
                aj.data = aa;
                P(aj, am, ah, ac);
                return;
              } else {
                w(ah, true);
              }
            }
            if (ac) {
              ac(X);
            }
          });
        } else {
          if (ac) {
            ac(X);
          }
        }
      },
      switchOffAutoHideShow: function () {
        m = false;
      },
      ua: M,
      getFlashPlayerVersion: function () {
        return {
          major: M.pv[0],
          minor: M.pv[1],
          release: M.pv[2]
        };
      },
      hasFlashPlayerVersion: F,
      createSWF: function (Z, Y, X) {
        if (M.w3) {
          return u(Z, Y, X);
        } else {
          return undefined;
        }
      },
      showExpressInstall: function (Z, aa, X, Y) {
        if (M.w3 && A()) {
          P(Z, aa, X, Y);
        }
      },
      removeSWF: function (X) {
        if (M.w3) {
          y(X);
        }
      },
      createCSS: function (aa, Z, Y, X) {
        if (M.w3) {
          v(aa, Z, Y, X);
        }
      },
      addDomLoadEvent: K,
      addLoadEvent: s,
      getQueryParamValue: function (aa) {
        var Z = j.location.search || j.location.hash;
        if (Z) {
          if (/\?/.test(Z)) {
            Z = Z.split('?')[1];
          }
          if (aa == null) {
            return L(Z);
          }
          var Y = Z.split('&');
          for (var X = 0; X < Y.length; X++) {
            if (Y[X].substring(0, Y[X].indexOf('=')) == aa) {
              return L(Y[X].substring(Y[X].indexOf('=') + 1));
            }
          }
        }
        return '';
      },
      expressInstallCallback: function () {
        if (a) {
          var X = c(R);
          if (X && l) {
            X.parentNode.replaceChild(l, X);
            if (Q) {
              w(Q, true);
              if (M.ie && M.win) {
                l.style.display = 'block';
              }
            }
            if (E) {
              E(B);
            }
          }
          a = false;
        }
      }
    };
  }();
/*
SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com

mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/

SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilzén and Mammon Media and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php
 
SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php
*/
var SWFUpload;
if (SWFUpload == undefined) {
  SWFUpload = function (a) {
    this.initSWFUpload(a);
  };
}
SWFUpload.prototype.initSWFUpload = function (b) {
  try {
    this.customSettings = {};
    this.settings = b;
    this.eventQueue = [];
    this.movieName = 'SWFUpload_' + SWFUpload.movieCount++;
    this.movieElement = null;
    SWFUpload.instances[this.movieName] = this;
    this.initSettings();
    this.loadFlash();
    this.displayDebugInfo();
  } catch (a) {
    delete SWFUpload.instances[this.movieName];
    throw a;
  }
};
SWFUpload.instances = {};
SWFUpload.movieCount = 0;
SWFUpload.version = '2.2.0 2009-03-25';
SWFUpload.QUEUE_ERROR = {
  QUEUE_LIMIT_EXCEEDED: -100,
  FILE_EXCEEDS_SIZE_LIMIT: -110,
  ZERO_BYTE_FILE: -120,
  INVALID_FILETYPE: -130
};
SWFUpload.UPLOAD_ERROR = {
  HTTP_ERROR: -200,
  MISSING_UPLOAD_URL: -210,
  IO_ERROR: -220,
  SECURITY_ERROR: -230,
  UPLOAD_LIMIT_EXCEEDED: -240,
  UPLOAD_FAILED: -250,
  SPECIFIED_FILE_ID_NOT_FOUND: -260,
  FILE_VALIDATION_FAILED: -270,
  FILE_CANCELLED: -280,
  UPLOAD_STOPPED: -290
};
SWFUpload.FILE_STATUS = {
  QUEUED: -1,
  IN_PROGRESS: -2,
  ERROR: -3,
  COMPLETE: -4,
  CANCELLED: -5
};
SWFUpload.BUTTON_ACTION = {
  SELECT_FILE: -100,
  SELECT_FILES: -110,
  START_UPLOAD: -120
};
SWFUpload.CURSOR = {
  ARROW: -1,
  HAND: -2
};
SWFUpload.WINDOW_MODE = {
  WINDOW: 'window',
  TRANSPARENT: 'transparent',
  OPAQUE: 'opaque'
};
SWFUpload.completeURL = function (a) {
  if (typeof a !== 'string' || a.match(/^https?:\/\//i) || a.match(/^\//)) {
    return a;
  }
  var c = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  var b = window.location.pathname.lastIndexOf('/');
  if (b <= 0) {
    path = '/';
  } else {
    path = window.location.pathname.substr(0, b) + '/';
  }
  return path + a;
};
SWFUpload.prototype.initSettings = function () {
  this.ensureDefault = function (b, a) {
    this.settings[b] = this.settings[b] == undefined ? a : this.settings[b];
  };
  this.ensureDefault('upload_url', '');
  this.ensureDefault('preserve_relative_urls', false);
  this.ensureDefault('file_post_name', 'Filedata');
  this.ensureDefault('post_params', {});
  this.ensureDefault('use_query_string', false);
  this.ensureDefault('requeue_on_error', false);
  this.ensureDefault('http_success', []);
  this.ensureDefault('assume_success_timeout', 0);
  this.ensureDefault('file_types', '*.*');
  this.ensureDefault('file_types_description', 'All Files');
  this.ensureDefault('file_size_limit', 0);
  this.ensureDefault('file_upload_limit', 0);
  this.ensureDefault('file_queue_limit', 0);
  this.ensureDefault('flash_url', 'swfupload.swf');
  this.ensureDefault('prevent_swf_caching', true);
  this.ensureDefault('button_image_url', '');
  this.ensureDefault('button_width', 1);
  this.ensureDefault('button_height', 1);
  this.ensureDefault('button_text', '');
  this.ensureDefault('button_text_style', 'color: #000000; font-size: 16pt;');
  this.ensureDefault('button_text_top_padding', 0);
  this.ensureDefault('button_text_left_padding', 0);
  this.ensureDefault('button_action', SWFUpload.BUTTON_ACTION.SELECT_FILES);
  this.ensureDefault('button_disabled', false);
  this.ensureDefault('button_placeholder_id', '');
  this.ensureDefault('button_placeholder', null);
  this.ensureDefault('button_cursor', SWFUpload.CURSOR.ARROW);
  this.ensureDefault('button_window_mode', SWFUpload.WINDOW_MODE.WINDOW);
  this.ensureDefault('debug', false);
  this.settings.debug_enabled = this.settings.debug;
  this.settings.return_upload_start_handler = this.returnUploadStart;
  this.ensureDefault('swfupload_loaded_handler', null);
  this.ensureDefault('file_dialog_start_handler', null);
  this.ensureDefault('file_queued_handler', null);
  this.ensureDefault('file_queue_error_handler', null);
  this.ensureDefault('file_dialog_complete_handler', null);
  this.ensureDefault('upload_start_handler', null);
  this.ensureDefault('upload_progress_handler', null);
  this.ensureDefault('upload_error_handler', null);
  this.ensureDefault('upload_success_handler', null);
  this.ensureDefault('upload_complete_handler', null);
  this.ensureDefault('debug_handler', this.debugMessage);
  this.ensureDefault('custom_settings', {});
  this.customSettings = this.settings.custom_settings;
  if (!!this.settings.prevent_swf_caching) {
    this.settings.flash_url = this.settings.flash_url + (this.settings.flash_url.indexOf('?') < 0 ? '?' : '&') + 'preventswfcaching=' + new Date().getTime();
  }
  if (!this.settings.preserve_relative_urls) {
    this.settings.upload_url = SWFUpload.completeURL(this.settings.upload_url);
    this.settings.button_image_url = SWFUpload.completeURL(this.settings.button_image_url);
  }
  delete this.ensureDefault;
};
SWFUpload.prototype.loadFlash = function () {
  var a, b;
  if (document.getElementById(this.movieName) !== null) {
    throw 'ID ' + this.movieName + ' is already in use. The Flash Object could not be added';
  }
  a = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;
  if (a == undefined) {
    throw 'Could not find the placeholder element: ' + this.settings.button_placeholder_id;
  }
  b = document.createElement('div');
  b.innerHTML = this.getFlashHTML();
  a.parentNode.replaceChild(b.firstChild, a);
  if (window[this.movieName] == undefined) {
    window[this.movieName] = this.getMovieElement();
  }
};
SWFUpload.prototype.getFlashHTML = function () {
  return [
    '<object id="',
    this.movieName,
    '" type="application/x-shockwave-flash" data="',
    this.settings.flash_url,
    '" width="',
    this.settings.button_width,
    '" height="',
    this.settings.button_height,
    '" class="swfupload">',
    '<param name="wmode" value="',
    this.settings.button_window_mode,
    '" />',
    '<param name="movie" value="',
    this.settings.flash_url,
    '" />',
    '<param name="quality" value="high" />',
    '<param name="menu" value="false" />',
    '<param name="allowScriptAccess" value="always" />',
    '<param name="flashvars" value="' + this.getFlashVars() + '" />',
    '</object>'
  ].join('');
};
SWFUpload.prototype.getFlashVars = function () {
  var b = this.buildParamString();
  var a = this.settings.http_success.join(',');
  return [
    'movieName=',
    encodeURIComponent(this.movieName),
    '&amp;uploadURL=',
    encodeURIComponent(this.settings.upload_url),
    '&amp;useQueryString=',
    encodeURIComponent(this.settings.use_query_string),
    '&amp;requeueOnError=',
    encodeURIComponent(this.settings.requeue_on_error),
    '&amp;httpSuccess=',
    encodeURIComponent(a),
    '&amp;assumeSuccessTimeout=',
    encodeURIComponent(this.settings.assume_success_timeout),
    '&amp;params=',
    encodeURIComponent(b),
    '&amp;filePostName=',
    encodeURIComponent(this.settings.file_post_name),
    '&amp;fileTypes=',
    encodeURIComponent(this.settings.file_types),
    '&amp;fileTypesDescription=',
    encodeURIComponent(this.settings.file_types_description),
    '&amp;fileSizeLimit=',
    encodeURIComponent(this.settings.file_size_limit),
    '&amp;fileUploadLimit=',
    encodeURIComponent(this.settings.file_upload_limit),
    '&amp;fileQueueLimit=',
    encodeURIComponent(this.settings.file_queue_limit),
    '&amp;debugEnabled=',
    encodeURIComponent(this.settings.debug_enabled),
    '&amp;buttonImageURL=',
    encodeURIComponent(this.settings.button_image_url),
    '&amp;buttonWidth=',
    encodeURIComponent(this.settings.button_width),
    '&amp;buttonHeight=',
    encodeURIComponent(this.settings.button_height),
    '&amp;buttonText=',
    encodeURIComponent(this.settings.button_text),
    '&amp;buttonTextTopPadding=',
    encodeURIComponent(this.settings.button_text_top_padding),
    '&amp;buttonTextLeftPadding=',
    encodeURIComponent(this.settings.button_text_left_padding),
    '&amp;buttonTextStyle=',
    encodeURIComponent(this.settings.button_text_style),
    '&amp;buttonAction=',
    encodeURIComponent(this.settings.button_action),
    '&amp;buttonDisabled=',
    encodeURIComponent(this.settings.button_disabled),
    '&amp;buttonCursor=',
    encodeURIComponent(this.settings.button_cursor)
  ].join('');
};
SWFUpload.prototype.getMovieElement = function () {
  if (this.movieElement == undefined) {
    this.movieElement = document.getElementById(this.movieName);
  }
  if (this.movieElement === null) {
    throw 'Could not find Flash element';
  }
  return this.movieElement;
};
SWFUpload.prototype.buildParamString = function () {
  var c = this.settings.post_params;
  var b = [];
  if (typeof c === 'object') {
    for (var a in c) {
      if (c.hasOwnProperty(a)) {
        b.push(encodeURIComponent(a.toString()) + '=' + encodeURIComponent(c[a].toString()));
      }
    }
  }
  return b.join('&amp;');
};
SWFUpload.prototype.destroy = function () {
  try {
    this.cancelUpload(null, false);
    var a = null;
    a = this.getMovieElement();
    if (a && typeof a.CallFunction === 'unknown') {
      for (var c in a) {
        try {
          if (typeof a[c] === 'function') {
            a[c] = null;
          }
        } catch (e) {
        }
      }
      try {
        a.parentNode.removeChild(a);
      } catch (b) {
      }
    }
    window[this.movieName] = null;
    SWFUpload.instances[this.movieName] = null;
    delete SWFUpload.instances[this.movieName];
    this.movieElement = null;
    this.settings = null;
    this.customSettings = null;
    this.eventQueue = null;
    this.movieName = null;
    return true;
  } catch (d) {
    return false;
  }
};
SWFUpload.prototype.displayDebugInfo = function () {
  this.debug([
    '---SWFUpload Instance Info---\n',
    'Version: ',
    SWFUpload.version,
    '\n',
    'Movie Name: ',
    this.movieName,
    '\n',
    'Settings:\n',
    '\t',
    'upload_url:               ',
    this.settings.upload_url,
    '\n',
    '\t',
    'flash_url:                ',
    this.settings.flash_url,
    '\n',
    '\t',
    'use_query_string:         ',
    this.settings.use_query_string.toString(),
    '\n',
    '\t',
    'requeue_on_error:         ',
    this.settings.requeue_on_error.toString(),
    '\n',
    '\t',
    'http_success:             ',
    this.settings.http_success.join(', '),
    '\n',
    '\t',
    'assume_success_timeout:   ',
    this.settings.assume_success_timeout,
    '\n',
    '\t',
    'file_post_name:           ',
    this.settings.file_post_name,
    '\n',
    '\t',
    'post_params:              ',
    this.settings.post_params.toString(),
    '\n',
    '\t',
    'file_types:               ',
    this.settings.file_types,
    '\n',
    '\t',
    'file_types_description:   ',
    this.settings.file_types_description,
    '\n',
    '\t',
    'file_size_limit:          ',
    this.settings.file_size_limit,
    '\n',
    '\t',
    'file_upload_limit:        ',
    this.settings.file_upload_limit,
    '\n',
    '\t',
    'file_queue_limit:         ',
    this.settings.file_queue_limit,
    '\n',
    '\t',
    'debug:                    ',
    this.settings.debug.toString(),
    '\n',
    '\t',
    'prevent_swf_caching:      ',
    this.settings.prevent_swf_caching.toString(),
    '\n',
    '\t',
    'button_placeholder_id:    ',
    this.settings.button_placeholder_id.toString(),
    '\n',
    '\t',
    'button_placeholder:       ',
    this.settings.button_placeholder ? 'Set' : 'Not Set',
    '\n',
    '\t',
    'button_image_url:         ',
    this.settings.button_image_url.toString(),
    '\n',
    '\t',
    'button_width:             ',
    this.settings.button_width.toString(),
    '\n',
    '\t',
    'button_height:            ',
    this.settings.button_height.toString(),
    '\n',
    '\t',
    'button_text:              ',
    this.settings.button_text.toString(),
    '\n',
    '\t',
    'button_text_style:        ',
    this.settings.button_text_style.toString(),
    '\n',
    '\t',
    'button_text_top_padding:  ',
    this.settings.button_text_top_padding.toString(),
    '\n',
    '\t',
    'button_text_left_padding: ',
    this.settings.button_text_left_padding.toString(),
    '\n',
    '\t',
    'button_action:            ',
    this.settings.button_action.toString(),
    '\n',
    '\t',
    'button_disabled:          ',
    this.settings.button_disabled.toString(),
    '\n',
    '\t',
    'custom_settings:          ',
    this.settings.custom_settings.toString(),
    '\n',
    'Event Handlers:\n',
    '\t',
    'swfupload_loaded_handler assigned:  ',
    (typeof this.settings.swfupload_loaded_handler === 'function').toString(),
    '\n',
    '\t',
    'file_dialog_start_handler assigned: ',
    (typeof this.settings.file_dialog_start_handler === 'function').toString(),
    '\n',
    '\t',
    'file_queued_handler assigned:       ',
    (typeof this.settings.file_queued_handler === 'function').toString(),
    '\n',
    '\t',
    'file_queue_error_handler assigned:  ',
    (typeof this.settings.file_queue_error_handler === 'function').toString(),
    '\n',
    '\t',
    'upload_start_handler assigned:      ',
    (typeof this.settings.upload_start_handler === 'function').toString(),
    '\n',
    '\t',
    'upload_progress_handler assigned:   ',
    (typeof this.settings.upload_progress_handler === 'function').toString(),
    '\n',
    '\t',
    'upload_error_handler assigned:      ',
    (typeof this.settings.upload_error_handler === 'function').toString(),
    '\n',
    '\t',
    'upload_success_handler assigned:    ',
    (typeof this.settings.upload_success_handler === 'function').toString(),
    '\n',
    '\t',
    'upload_complete_handler assigned:   ',
    (typeof this.settings.upload_complete_handler === 'function').toString(),
    '\n',
    '\t',
    'debug_handler assigned:             ',
    (typeof this.settings.debug_handler === 'function').toString(),
    '\n'
  ].join(''));
};
SWFUpload.prototype.addSetting = function (b, c, a) {
  if (c == undefined) {
    return this.settings[b] = a;
  } else {
    return this.settings[b] = c;
  }
};
SWFUpload.prototype.getSetting = function (a) {
  if (this.settings[a] != undefined) {
    return this.settings[a];
  }
  return '';
};
SWFUpload.prototype.callFlash = function (functionName, argumentArray) {
  argumentArray = argumentArray || [];
  var movieElement = this.getMovieElement();
  var returnValue, returnString;
  try {
    returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + '</invoke>');
    returnValue = eval(returnString);
  } catch (ex) {
    throw 'Call to ' + functionName + ' failed';
  }
  if (returnValue != undefined && typeof returnValue.post === 'object') {
    returnValue = this.unescapeFilePostParams(returnValue);
  }
  return returnValue;
};
SWFUpload.prototype.selectFile = function () {
  this.callFlash('SelectFile');
};
SWFUpload.prototype.selectFiles = function () {
  this.callFlash('SelectFiles');
};
SWFUpload.prototype.startUpload = function (a) {
  this.callFlash('StartUpload', [a]);
};
SWFUpload.prototype.cancelUpload = function (a, b) {
  if (b !== false) {
    b = true;
  }
  this.callFlash('CancelUpload', [
    a,
    b
  ]);
};
SWFUpload.prototype.stopUpload = function () {
  this.callFlash('StopUpload');
};
SWFUpload.prototype.getStats = function () {
  return this.callFlash('GetStats');
};
SWFUpload.prototype.setStats = function (a) {
  this.callFlash('SetStats', [a]);
};
SWFUpload.prototype.getFile = function (a) {
  if (typeof a === 'number') {
    return this.callFlash('GetFileByIndex', [a]);
  } else {
    return this.callFlash('GetFile', [a]);
  }
};
SWFUpload.prototype.addFileParam = function (a, b, c) {
  return this.callFlash('AddFileParam', [
    a,
    b,
    c
  ]);
};
SWFUpload.prototype.removeFileParam = function (a, b) {
  this.callFlash('RemoveFileParam', [
    a,
    b
  ]);
};
SWFUpload.prototype.setUploadURL = function (a) {
  this.settings.upload_url = a.toString();
  this.callFlash('SetUploadURL', [a]);
};
SWFUpload.prototype.setPostParams = function (a) {
  this.settings.post_params = a;
  this.callFlash('SetPostParams', [a]);
};
SWFUpload.prototype.addPostParam = function (a, b) {
  this.settings.post_params[a] = b;
  this.callFlash('SetPostParams', [this.settings.post_params]);
};
SWFUpload.prototype.removePostParam = function (a) {
  delete this.settings.post_params[a];
  this.callFlash('SetPostParams', [this.settings.post_params]);
};
SWFUpload.prototype.setFileTypes = function (a, b) {
  this.settings.file_types = a;
  this.settings.file_types_description = b;
  this.callFlash('SetFileTypes', [
    a,
    b
  ]);
};
SWFUpload.prototype.setFileSizeLimit = function (a) {
  this.settings.file_size_limit = a;
  this.callFlash('SetFileSizeLimit', [a]);
};
SWFUpload.prototype.setFileUploadLimit = function (a) {
  this.settings.file_upload_limit = a;
  this.callFlash('SetFileUploadLimit', [a]);
};
SWFUpload.prototype.setFileQueueLimit = function (a) {
  this.settings.file_queue_limit = a;
  this.callFlash('SetFileQueueLimit', [a]);
};
SWFUpload.prototype.setFilePostName = function (a) {
  this.settings.file_post_name = a;
  this.callFlash('SetFilePostName', [a]);
};
SWFUpload.prototype.setUseQueryString = function (a) {
  this.settings.use_query_string = a;
  this.callFlash('SetUseQueryString', [a]);
};
SWFUpload.prototype.setRequeueOnError = function (a) {
  this.settings.requeue_on_error = a;
  this.callFlash('SetRequeueOnError', [a]);
};
SWFUpload.prototype.setHTTPSuccess = function (a) {
  if (typeof a === 'string') {
    a = a.replace(' ', '').split(',');
  }
  this.settings.http_success = a;
  this.callFlash('SetHTTPSuccess', [a]);
};
SWFUpload.prototype.setAssumeSuccessTimeout = function (a) {
  this.settings.assume_success_timeout = a;
  this.callFlash('SetAssumeSuccessTimeout', [a]);
};
SWFUpload.prototype.setDebugEnabled = function (a) {
  this.settings.debug_enabled = a;
  this.callFlash('SetDebugEnabled', [a]);
};
SWFUpload.prototype.setButtonImageURL = function (a) {
  if (a == undefined) {
    a = '';
  }
  this.settings.button_image_url = a;
  this.callFlash('SetButtonImageURL', [a]);
};
SWFUpload.prototype.setButtonDimensions = function (c, a) {
  this.settings.button_width = c;
  this.settings.button_height = a;
  var b = this.getMovieElement();
  if (b != undefined) {
    b.style.width = c + 'px';
    b.style.height = a + 'px';
  }
  this.callFlash('SetButtonDimensions', [
    c,
    a
  ]);
};
SWFUpload.prototype.setButtonText = function (a) {
  this.settings.button_text = a;
  this.callFlash('SetButtonText', [a]);
};
SWFUpload.prototype.setButtonTextPadding = function (b, a) {
  this.settings.button_text_top_padding = a;
  this.settings.button_text_left_padding = b;
  this.callFlash('SetButtonTextPadding', [
    b,
    a
  ]);
};
SWFUpload.prototype.setButtonTextStyle = function (a) {
  this.settings.button_text_style = a;
  this.callFlash('SetButtonTextStyle', [a]);
};
SWFUpload.prototype.setButtonDisabled = function (a) {
  this.settings.button_disabled = a;
  this.callFlash('SetButtonDisabled', [a]);
};
SWFUpload.prototype.setButtonAction = function (a) {
  this.settings.button_action = a;
  this.callFlash('SetButtonAction', [a]);
};
SWFUpload.prototype.setButtonCursor = function (a) {
  this.settings.button_cursor = a;
  this.callFlash('SetButtonCursor', [a]);
};
SWFUpload.prototype.queueEvent = function (b, c) {
  if (c == undefined) {
    c = [];
  } else {
    if (!(c instanceof Array)) {
      c = [c];
    }
  }
  var a = this;
  if (typeof this.settings[b] === 'function') {
    this.eventQueue.push(function () {
      this.settings[b].apply(this, c);
    });
    setTimeout(function () {
      a.executeNextEvent();
    }, 0);
  } else {
    if (this.settings[b] !== null) {
      throw 'Event handler ' + b + ' is unknown or is not a function';
    }
  }
};
SWFUpload.prototype.executeNextEvent = function () {
  var a = this.eventQueue ? this.eventQueue.shift() : null;
  if (typeof a === 'function') {
    a.apply(this);
  }
};
SWFUpload.prototype.unescapeFilePostParams = function (c) {
  var e = /[$]([0-9a-f]{4})/i;
  var f = {};
  var d;
  if (c != undefined) {
    for (var a in c.post) {
      if (c.post.hasOwnProperty(a)) {
        d = a;
        var b;
        while ((b = e.exec(d)) !== null) {
          d = d.replace(b[0], String.fromCharCode(parseInt('0x' + b[1], 16)));
        }
        f[d] = c.post[a];
      }
    }
    c.post = f;
  }
  return c;
};
SWFUpload.prototype.testExternalInterface = function () {
  try {
    return this.callFlash('TestExternalInterface');
  } catch (a) {
    return false;
  }
};
SWFUpload.prototype.flashReady = function () {
  var a = this.getMovieElement();
  if (!a) {
    this.debug('Flash called back ready but the flash movie can\'t be found.');
    return;
  }
  this.cleanUp(a);
  this.queueEvent('swfupload_loaded_handler');
};
SWFUpload.prototype.cleanUp = function (a) {
  try {
    if (this.movieElement && typeof a.CallFunction === 'unknown') {
      this.debug('Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)');
      for (var c in a) {
        try {
          if (typeof a[c] === 'function') {
            a[c] = null;
          }
        } catch (b) {
        }
      }
    }
  } catch (d) {
  }
  window.__flash__removeCallback = function (e, f) {
    try {
      if (e) {
        e[f] = null;
      }
    } catch (g) {
    }
  };
};
SWFUpload.prototype.fileDialogStart = function () {
  this.queueEvent('file_dialog_start_handler');
};
SWFUpload.prototype.fileQueued = function (a) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('file_queued_handler', a);
};
SWFUpload.prototype.fileQueueError = function (a, c, b) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('file_queue_error_handler', [
    a,
    c,
    b
  ]);
};
SWFUpload.prototype.fileDialogComplete = function (b, c, a) {
  this.queueEvent('file_dialog_complete_handler', [
    b,
    c,
    a
  ]);
};
SWFUpload.prototype.uploadStart = function (a) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('return_upload_start_handler', a);
};
SWFUpload.prototype.returnUploadStart = function (a) {
  var b;
  if (typeof this.settings.upload_start_handler === 'function') {
    a = this.unescapeFilePostParams(a);
    b = this.settings.upload_start_handler.call(this, a);
  } else {
    if (this.settings.upload_start_handler != undefined) {
      throw 'upload_start_handler must be a function';
    }
  }
  if (b === undefined) {
    b = true;
  }
  b = !!b;
  this.callFlash('ReturnUploadStart', [b]);
};
SWFUpload.prototype.uploadProgress = function (a, c, b) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('upload_progress_handler', [
    a,
    c,
    b
  ]);
};
SWFUpload.prototype.uploadError = function (a, c, b) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('upload_error_handler', [
    a,
    c,
    b
  ]);
};
SWFUpload.prototype.uploadSuccess = function (b, a, c) {
  b = this.unescapeFilePostParams(b);
  this.queueEvent('upload_success_handler', [
    b,
    a,
    c
  ]);
};
SWFUpload.prototype.uploadComplete = function (a) {
  a = this.unescapeFilePostParams(a);
  this.queueEvent('upload_complete_handler', a);
};
SWFUpload.prototype.debug = function (a) {
  this.queueEvent('debug_handler', a);
};
SWFUpload.prototype.debugMessage = function (c) {
  if (this.settings.debug) {
    var a, d = [];
    if (typeof c === 'object' && typeof c.name === 'string' && typeof c.message === 'string') {
      for (var b in c) {
        if (c.hasOwnProperty(b)) {
          d.push(b + ': ' + c[b]);
        }
      }
      a = d.join('\n') || '';
      d = a.split('\n');
      a = 'EXCEPTION: ' + d.join('\nEXCEPTION: ');
      SWFUpload.Console.writeLine(a);
    } else {
      SWFUpload.Console.writeLine(c);
    }
  }
};
SWFUpload.Console = {};
SWFUpload.Console.writeLine = function (d) {
  var b, a;
  try {
    b = document.getElementById('SWFUpload_Console');
    if (!b) {
      a = document.createElement('form');
      document.getElementsByTagName('body')[0].appendChild(a);
      b = document.createElement('textarea');
      b.id = 'SWFUpload_Console';
      b.style.fontFamily = 'monospace';
      b.setAttribute('wrap', 'off');
      b.wrap = 'off';
      b.style.overflow = 'auto';
      b.style.width = '700px';
      b.style.height = '350px';
      b.style.margin = '5px';
      a.appendChild(b);
    }
    b.value += d + '\n';
    b.scrollTop = b.scrollHeight - b.clientHeight;
  } catch (c) {
    alert('Exception: ' + c.name + ' Message: ' + c.message);
  }
};
/*
Uploadify v3.2.1
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
(function ($) {
  // These methods can be called by adding them as the first argument in the uploadify plugin call
  var methods = {
      init: function (options, swfUploadOptions) {
        return this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this);
          // Clone the original DOM object
          var $clone = $this.clone();
          // Setup the default options
          var settings = $.extend({
              id: $this.attr('id'),
              swf: 'uploadify.swf',
              uploader: 'uploadify.php',
              auto: true,
              buttonClass: '',
              buttonCursor: 'hand',
              buttonImage: null,
              buttonText: 'SELECT FILES',
              checkExisting: false,
              debug: false,
              fileObjName: 'Filedata',
              fileSizeLimit: 0,
              fileTypeDesc: 'All Files',
              fileTypeExts: '*.*',
              height: 27,
              itemTemplate: false,
              method: 'post',
              multi: true,
              formData: {},
              preventCaching: true,
              progressData: 'percentage',
              queueID: false,
              queueSizeLimit: 999,
              removeCompleted: true,
              removeTimeout: 3,
              requeueErrors: false,
              successTimeout: 30,
              uploadLimit: 0,
              width: 94,
              overrideEvents: []
            }, options);
          // Prepare settings for SWFUpload
          var swfUploadSettings = {
              assume_success_timeout: settings.successTimeout,
              button_placeholder_id: settings.id,
              button_width: settings.width,
              button_height: settings.height,
              button_text: null,
              button_text_style: null,
              button_text_top_padding: 0,
              button_text_left_padding: 0,
              button_action: settings.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE,
              button_disabled: false,
              button_cursor: settings.buttonCursor == 'arrow' ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND,
              button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
              debug: settings.debug,
              requeue_on_error: settings.requeueErrors,
              file_post_name: settings.fileObjName,
              file_size_limit: settings.fileSizeLimit,
              file_types: settings.fileTypeExts,
              file_types_description: settings.fileTypeDesc,
              file_queue_limit: settings.queueSizeLimit,
              file_upload_limit: settings.uploadLimit,
              flash_url: settings.swf,
              prevent_swf_caching: settings.preventCaching,
              post_params: settings.formData,
              upload_url: settings.uploader,
              use_query_string: settings.method == 'get',
              file_dialog_complete_handler: handlers.onDialogClose,
              file_dialog_start_handler: handlers.onDialogOpen,
              file_queued_handler: handlers.onSelect,
              file_queue_error_handler: handlers.onSelectError,
              swfupload_loaded_handler: settings.onSWFReady,
              upload_complete_handler: handlers.onUploadComplete,
              upload_error_handler: handlers.onUploadError,
              upload_progress_handler: handlers.onUploadProgress,
              upload_start_handler: handlers.onUploadStart,
              upload_success_handler: handlers.onUploadSuccess
            };
          // Merge the user-defined options with the defaults
          if (swfUploadOptions) {
            swfUploadSettings = $.extend(swfUploadSettings, swfUploadOptions);
          }
          // Add the user-defined settings to the swfupload object
          swfUploadSettings = $.extend(swfUploadSettings, settings);
          // Detect if Flash is available
          var playerVersion = swfobject.getFlashPlayerVersion();
          var flashInstalled = playerVersion.major >= 9;
          if (flashInstalled) {
            // Create the swfUpload instance
            window['uploadify_' + settings.id] = new SWFUpload(swfUploadSettings);
            var swfuploadify = window['uploadify_' + settings.id];
            // Add the SWFUpload object to the elements data object
            $this.data('uploadify', swfuploadify);
            // Wrap the instance
            var $wrapper = $('<div />', {
                'id': settings.id,
                'class': 'uploadify',
                'css': {
                  'height': settings.height + 'px',
                  'width': settings.width + 'px'
                }
              });
            $('#' + swfuploadify.movieName).wrap($wrapper);
            // Recreate the reference to wrapper
            $wrapper = $('#' + settings.id);
            // Add the data object to the wrapper 
            $wrapper.data('uploadify', swfuploadify);
            // Create the button
            var $button = $('<div />', {
                'id': settings.id + '-button',
                'class': 'uploadify-button ' + settings.buttonClass
              });
            if (settings.buttonImage) {
              $button.css({
                'background-image': 'url(\'' + settings.buttonImage + '\')',
                'text-indent': '-9999px'
              });
            }
            $button.html('<span class="uploadify-button-text">' + settings.buttonText + '</span>').css({
              'height': settings.height + 'px',
              'line-height': settings.height + 'px',
              'width': settings.width + 'px'
            });
            // Append the button to the wrapper
            $wrapper.append($button);
            // Adjust the styles of the movie
            $('#' + swfuploadify.movieName).css({
              'position': 'absolute',
              'z-index': 1
            });
            // Create the file queue
            if (!settings.queueID) {
              var $queue = $('<div />', {
                  'id': settings.id + '-queue',
                  'class': 'uploadify-queue'
                });
              $wrapper.after($queue);
              swfuploadify.settings.queueID = settings.id + '-queue';
              swfuploadify.settings.defaultQueue = true;
            }
            // Create some queue related objects and variables
            swfuploadify.queueData = {
              files: {},
              filesSelected: 0,
              filesQueued: 0,
              filesReplaced: 0,
              filesCancelled: 0,
              filesErrored: 0,
              uploadsSuccessful: 0,
              uploadsErrored: 0,
              averageSpeed: 0,
              queueLength: 0,
              queueSize: 0,
              uploadSize: 0,
              queueBytesUploaded: 0,
              uploadQueue: [],
              errorMsg: 'Some files were not added to the queue:'
            };
            // Save references to all the objects
            swfuploadify.original = $clone;
            swfuploadify.wrapper = $wrapper;
            swfuploadify.button = $button;
            swfuploadify.queue = $queue;
            // Call the user-defined init event handler
            if (settings.onInit)
              settings.onInit.call($this, swfuploadify);
          } else {
            // Call the fallback function
            if (settings.onFallback)
              settings.onFallback.call($this);
          }
        });
      },
      cancel: function (fileID, supressEvent) {
        var args = arguments;
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify'), settings = swfuploadify.settings, delay = -1;
          if (args[0]) {
            // Clear the queue
            if (args[0] == '*') {
              var queueItemCount = swfuploadify.queueData.queueLength;
              $('#' + settings.queueID).find('.uploadify-queue-item').each(function () {
                delay++;
                if (args[1] === true) {
                  swfuploadify.cancelUpload($(this).attr('id'), false);
                } else {
                  swfuploadify.cancelUpload($(this).attr('id'));
                }
                $(this).find('.data').removeClass('data').html(' - Cancelled');
                $(this).find('.uploadify-progress-bar').remove();
                $(this).delay(1000 + 100 * delay).fadeOut(500, function () {
                  $(this).remove();
                });
              });
              swfuploadify.queueData.queueSize = 0;
              swfuploadify.queueData.queueLength = 0;
              // Trigger the onClearQueue event
              if (settings.onClearQueue)
                settings.onClearQueue.call($this, queueItemCount);
            } else {
              for (var n = 0; n < args.length; n++) {
                swfuploadify.cancelUpload(args[n]);
                $('#' + args[n]).find('.data').removeClass('data').html(' - Cancelled');
                $('#' + args[n]).find('.uploadify-progress-bar').remove();
                $('#' + args[n]).delay(1000 + 100 * n).fadeOut(500, function () {
                  $(this).remove();
                });
              }
            }
          } else {
            var item = $('#' + settings.queueID).find('.uploadify-queue-item').get(0);
            $item = $(item);
            swfuploadify.cancelUpload($item.attr('id'));
            $item.find('.data').removeClass('data').html(' - Cancelled');
            $item.find('.uploadify-progress-bar').remove();
            $item.delay(1000).fadeOut(500, function () {
              $(this).remove();
            });
          }
        });
      },
      destroy: function () {
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify'), settings = swfuploadify.settings;
          // Destroy the SWF object and 
          swfuploadify.destroy();
          // Destroy the queue
          if (settings.defaultQueue) {
            $('#' + settings.queueID).remove();
          }
          // Reload the original DOM element
          $('#' + settings.id).replaceWith(swfuploadify.original);
          // Call the user-defined event handler
          if (settings.onDestroy)
            settings.onDestroy.call(this);
          delete swfuploadify;
        });
      },
      disable: function (isDisabled) {
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify'), settings = swfuploadify.settings;
          // Call the user-defined event handlers
          if (isDisabled) {
            swfuploadify.button.addClass('disabled');
            if (settings.onDisable)
              settings.onDisable.call(this);
          } else {
            swfuploadify.button.removeClass('disabled');
            if (settings.onEnable)
              settings.onEnable.call(this);
          }
          // Enable/disable the browse button
          swfuploadify.setButtonDisabled(isDisabled);
        });
      },
      settings: function (name, value, resetObjects) {
        var args = arguments;
        var returnValue = value;
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify'), settings = swfuploadify.settings;
          if (typeof args[0] == 'object') {
            for (var n in value) {
              setData(n, value[n]);
            }
          }
          if (args.length === 1) {
            returnValue = settings[name];
          } else {
            switch (name) {
            case 'uploader':
              swfuploadify.setUploadURL(value);
              break;
            case 'formData':
              if (!resetObjects) {
                value = $.extend(settings.formData, value);
              }
              swfuploadify.setPostParams(settings.formData);
              break;
            case 'method':
              if (value == 'get') {
                swfuploadify.setUseQueryString(true);
              } else {
                swfuploadify.setUseQueryString(false);
              }
              break;
            case 'fileObjName':
              swfuploadify.setFilePostName(value);
              break;
            case 'fileTypeExts':
              swfuploadify.setFileTypes(value, settings.fileTypeDesc);
              break;
            case 'fileTypeDesc':
              swfuploadify.setFileTypes(settings.fileTypeExts, value);
              break;
            case 'fileSizeLimit':
              swfuploadify.setFileSizeLimit(value);
              break;
            case 'uploadLimit':
              swfuploadify.setFileUploadLimit(value);
              break;
            case 'queueSizeLimit':
              swfuploadify.setFileQueueLimit(value);
              break;
            case 'buttonImage':
              swfuploadify.button.css('background-image', settingValue);
              break;
            case 'buttonCursor':
              if (value == 'arrow') {
                swfuploadify.setButtonCursor(SWFUpload.CURSOR.ARROW);
              } else {
                swfuploadify.setButtonCursor(SWFUpload.CURSOR.HAND);
              }
              break;
            case 'buttonText':
              $('#' + settings.id + '-button').find('.uploadify-button-text').html(value);
              break;
            case 'width':
              swfuploadify.setButtonDimensions(value, settings.height);
              break;
            case 'height':
              swfuploadify.setButtonDimensions(settings.width, value);
              break;
            case 'multi':
              if (value) {
                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES);
              } else {
                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);
              }
              break;
            }
            settings[name] = value;
          }
        });
        if (args.length === 1) {
          return returnValue;
        }
      },
      stop: function () {
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify');
          // Reset the queue information
          swfuploadify.queueData.averageSpeed = 0;
          swfuploadify.queueData.uploadSize = 0;
          swfuploadify.queueData.bytesUploaded = 0;
          swfuploadify.queueData.uploadQueue = [];
          swfuploadify.stopUpload();
        });
      },
      upload: function () {
        var args = arguments;
        this.each(function () {
          // Create a reference to the jQuery DOM object
          var $this = $(this), swfuploadify = $this.data('uploadify');
          // Reset the queue information
          swfuploadify.queueData.averageSpeed = 0;
          swfuploadify.queueData.uploadSize = 0;
          swfuploadify.queueData.bytesUploaded = 0;
          swfuploadify.queueData.uploadQueue = [];
          // Upload the files
          if (args[0]) {
            if (args[0] == '*') {
              swfuploadify.queueData.uploadSize = swfuploadify.queueData.queueSize;
              swfuploadify.queueData.uploadQueue.push('*');
              swfuploadify.startUpload();
            } else {
              for (var n = 0; n < args.length; n++) {
                swfuploadify.queueData.uploadSize += swfuploadify.queueData.files[args[n]].size;
                swfuploadify.queueData.uploadQueue.push(args[n]);
              }
              swfuploadify.startUpload(swfuploadify.queueData.uploadQueue.shift());
            }
          } else {
            swfuploadify.startUpload();
          }
        });
      }
    };
  // These functions handle all the events that occur with the file uploader
  var handlers = {
      onDialogOpen: function () {
        // Load the swfupload settings
        var settings = this.settings;
        // Reset some queue info
        this.queueData.errorMsg = 'Some files were not added to the queue:';
        this.queueData.filesReplaced = 0;
        this.queueData.filesCancelled = 0;
        // Call the user-defined event handler
        if (settings.onDialogOpen)
          settings.onDialogOpen.call(this);
      },
      onDialogClose: function (filesSelected, filesQueued, queueLength) {
        // Load the swfupload settings
        var settings = this.settings;
        // Update the queue information
        this.queueData.filesErrored = filesSelected - filesQueued;
        this.queueData.filesSelected = filesSelected;
        this.queueData.filesQueued = filesQueued - this.queueData.filesCancelled;
        this.queueData.queueLength = queueLength;
        // Run the default event handler
        if ($.inArray('onDialogClose', settings.overrideEvents) < 0) {
          if (this.queueData.filesErrored > 0) {
            alert(this.queueData.errorMsg);
          }
        }
        // Call the user-defined event handler
        if (settings.onDialogClose)
          settings.onDialogClose.call(this, this.queueData);
        // Upload the files if auto is true
        if (settings.auto)
          $('#' + settings.id).uploadify('upload', '*');
      },
      onSelect: function (file) {
        // Load the swfupload settings
        var settings = this.settings;
        // Check if a file with the same name exists in the queue
        var queuedFile = {};
        for (var n in this.queueData.files) {
          queuedFile = this.queueData.files[n];
          if (queuedFile.uploaded != true && queuedFile.name == file.name) {
            var replaceQueueItem = confirm('The file named "' + file.name + '" is already in the queue.\nDo you want to replace the existing item in the queue?');
            if (!replaceQueueItem) {
              this.cancelUpload(file.id);
              this.queueData.filesCancelled++;
              return false;
            } else {
              $('#' + queuedFile.id).remove();
              this.cancelUpload(queuedFile.id);
              this.queueData.filesReplaced++;
            }
          }
        }
        // Get the size of the file
        var fileSize = Math.round(file.size / 1024);
        var suffix = 'KB';
        if (fileSize > 1000) {
          fileSize = Math.round(fileSize / 1000);
          suffix = 'MB';
        }
        var fileSizeParts = fileSize.toString().split('.');
        fileSize = fileSizeParts[0];
        if (fileSizeParts.length > 1) {
          fileSize += '.' + fileSizeParts[1].substr(0, 2);
        }
        fileSize += suffix;
        // Truncate the filename if it's too long
        var fileName = file.name;
        if (fileName.length > 25) {
          fileName = fileName.substr(0, 25) + '...';
        }
        // Create the file data object
        itemData = {
          'fileID': file.id,
          'instanceID': settings.id,
          'fileName': fileName,
          'fileSize': fileSize
        };
        // Create the file item template
        if (settings.itemTemplate == false) {
          settings.itemTemplate = '<div id="${fileID}" class="uploadify-queue-item">\t\t\t\t\t<div class="cancel">\t\t\t\t\t\t<a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')">X</a>\t\t\t\t\t</div>\t\t\t\t\t<span class="fileName">${fileName} (${fileSize})</span><span class="data"></span>\t\t\t\t\t<div class="uploadify-progress">\t\t\t\t\t\t<div class="uploadify-progress-bar"><!--Progress Bar--></div>\t\t\t\t\t</div>\t\t\t\t</div>';
        }
        // Run the default event handler
        if ($.inArray('onSelect', settings.overrideEvents) < 0) {
          // Replace the item data in the template
          itemHTML = settings.itemTemplate;
          for (var d in itemData) {
            itemHTML = itemHTML.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
          }
          // Add the file item to the queue
          $('#' + settings.queueID).append(itemHTML);
        }
        this.queueData.queueSize += file.size;
        this.queueData.files[file.id] = file;
        // Call the user-defined event handler
        if (settings.onSelect)
          settings.onSelect.apply(this, arguments);
      },
      onSelectError: function (file, errorCode, errorMsg) {
        // Load the swfupload settings
        var settings = this.settings;
        // Run the default event handler
        if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
          switch (errorCode) {
          case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
            if (settings.queueSizeLimit > errorMsg) {
              this.queueData.errorMsg += '\nThe number of files selected exceeds the remaining upload limit (' + errorMsg + ').';
            } else {
              this.queueData.errorMsg += '\nThe number of files selected exceeds the queue size limit (' + settings.queueSizeLimit + ').';
            }
            break;
          case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" exceeds the size limit (' + settings.fileSizeLimit + ').';
            break;
          case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" is empty.';
            break;
          case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" is not an accepted file type (' + settings.fileTypeDesc + ').';
            break;
          }
        }
        if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
          delete this.queueData.files[file.id];
        }
        // Call the user-defined event handler
        if (settings.onSelectError)
          settings.onSelectError.apply(this, arguments);
      },
      onQueueComplete: function () {
        if (this.settings.onQueueComplete)
          this.settings.onQueueComplete.call(this, this.settings.queueData);
      },
      onUploadComplete: function (file) {
        // Load the swfupload settings
        var settings = this.settings, swfuploadify = this;
        // Check if all the files have completed uploading
        var stats = this.getStats();
        this.queueData.queueLength = stats.files_queued;
        if (this.queueData.uploadQueue[0] == '*') {
          if (this.queueData.queueLength > 0) {
            this.startUpload();
          } else {
            this.queueData.uploadQueue = [];
            // Call the user-defined event handler for queue complete
            if (settings.onQueueComplete)
              settings.onQueueComplete.call(this, this.queueData);
          }
        } else {
          if (this.queueData.uploadQueue.length > 0) {
            this.startUpload(this.queueData.uploadQueue.shift());
          } else {
            this.queueData.uploadQueue = [];
            // Call the user-defined event handler for queue complete
            if (settings.onQueueComplete)
              settings.onQueueComplete.call(this, this.queueData);
          }
        }
        // Call the default event handler
        if ($.inArray('onUploadComplete', settings.overrideEvents) < 0) {
          if (settings.removeCompleted) {
            switch (file.filestatus) {
            case SWFUpload.FILE_STATUS.COMPLETE:
              setTimeout(function () {
                if ($('#' + file.id)) {
                  swfuploadify.queueData.queueSize -= file.size;
                  swfuploadify.queueData.queueLength -= 1;
                  delete swfuploadify.queueData.files[file.id];
                  $('#' + file.id).fadeOut(500, function () {
                    $(this).remove();
                  });
                }
              }, settings.removeTimeout * 1000);
              break;
            case SWFUpload.FILE_STATUS.ERROR:
              if (!settings.requeueErrors) {
                setTimeout(function () {
                  if ($('#' + file.id)) {
                    swfuploadify.queueData.queueSize -= file.size;
                    swfuploadify.queueData.queueLength -= 1;
                    delete swfuploadify.queueData.files[file.id];
                    $('#' + file.id).fadeOut(500, function () {
                      $(this).remove();
                    });
                  }
                }, settings.removeTimeout * 1000);
              }
              break;
            }
          } else {
            file.uploaded = true;
          }
        }
        // Call the user-defined event handler
        if (settings.onUploadComplete)
          settings.onUploadComplete.call(this, file);
      },
      onUploadError: function (file, errorCode, errorMsg) {
        // Load the swfupload settings
        var settings = this.settings;
        // Set the error string
        var errorString = 'Error';
        switch (errorCode) {
        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
          errorString = 'HTTP Error (' + errorMsg + ')';
          break;
        case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
          errorString = 'Missing Upload URL';
          break;
        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
          errorString = 'IO Error';
          break;
        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
          errorString = 'Security Error';
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
          alert('The upload limit has been reached (' + errorMsg + ').');
          errorString = 'Exceeds Upload Limit';
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
          errorString = 'Failed';
          break;
        case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
          break;
        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
          errorString = 'Validation Error';
          break;
        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
          errorString = 'Cancelled';
          this.queueData.queueSize -= file.size;
          this.queueData.queueLength -= 1;
          if (file.status == SWFUpload.FILE_STATUS.IN_PROGRESS || $.inArray(file.id, this.queueData.uploadQueue) >= 0) {
            this.queueData.uploadSize -= file.size;
          }
          // Trigger the onCancel event
          if (settings.onCancel)
            settings.onCancel.call(this, file);
          delete this.queueData.files[file.id];
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
          errorString = 'Stopped';
          break;
        }
        // Call the default event handler
        if ($.inArray('onUploadError', settings.overrideEvents) < 0) {
          if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
            $('#' + file.id).addClass('uploadify-error');
          }
          // Reset the progress bar
          $('#' + file.id).find('.uploadify-progress-bar').css('width', '1px');
          // Add the error message to the queue item
          if (errorCode != SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND && file.status != SWFUpload.FILE_STATUS.COMPLETE) {
            $('#' + file.id).find('.data').html(' - ' + errorString);
          }
        }
        var stats = this.getStats();
        this.queueData.uploadsErrored = stats.upload_errors;
        // Call the user-defined event handler
        if (settings.onUploadError)
          settings.onUploadError.call(this, file, errorCode, errorMsg, errorString);
      },
      onUploadProgress: function (file, fileBytesLoaded, fileTotalBytes) {
        // Load the swfupload settings
        var settings = this.settings;
        // Setup all the variables
        var timer = new Date();
        var newTime = timer.getTime();
        var lapsedTime = newTime - this.timer;
        if (lapsedTime > 500) {
          this.timer = newTime;
        }
        var lapsedBytes = fileBytesLoaded - this.bytesLoaded;
        this.bytesLoaded = fileBytesLoaded;
        var queueBytesLoaded = this.queueData.queueBytesUploaded + fileBytesLoaded;
        var percentage = Math.round(fileBytesLoaded / fileTotalBytes * 100);
        // Calculate the average speed
        var suffix = 'KB/s';
        var mbs = 0;
        var kbs = lapsedBytes / 1024 / (lapsedTime / 1000);
        kbs = Math.floor(kbs * 10) / 10;
        if (this.queueData.averageSpeed > 0) {
          this.queueData.averageSpeed = Math.floor((this.queueData.averageSpeed + kbs) / 2);
        } else {
          this.queueData.averageSpeed = Math.floor(kbs);
        }
        if (kbs > 1000) {
          mbs = kbs * 0.001;
          this.queueData.averageSpeed = Math.floor(mbs);
          suffix = 'MB/s';
        }
        // Call the default event handler
        if ($.inArray('onUploadProgress', settings.overrideEvents) < 0) {
          if (settings.progressData == 'percentage') {
            $('#' + file.id).find('.data').html(' - ' + percentage + '%');
          } else if (settings.progressData == 'speed' && lapsedTime > 500) {
            $('#' + file.id).find('.data').html(' - ' + this.queueData.averageSpeed + suffix);
          }
          $('#' + file.id).find('.uploadify-progress-bar').css('width', percentage + '%');
        }
        // Call the user-defined event handler
        if (settings.onUploadProgress)
          settings.onUploadProgress.call(this, file, fileBytesLoaded, fileTotalBytes, queueBytesLoaded, this.queueData.uploadSize);
      },
      onUploadStart: function (file) {
        // Load the swfupload settings
        var settings = this.settings;
        var timer = new Date();
        this.timer = timer.getTime();
        this.bytesLoaded = 0;
        if (this.queueData.uploadQueue.length == 0) {
          this.queueData.uploadSize = file.size;
        }
        if (settings.checkExisting) {
          $.ajax({
            type: 'POST',
            async: false,
            url: settings.checkExisting,
            data: { filename: file.name },
            success: function (data) {
              if (data == 1) {
                var overwrite = confirm('A file with the name "' + file.name + '" already exists on the server.\nWould you like to replace the existing file?');
                if (!overwrite) {
                  this.cancelUpload(file.id);
                  $('#' + file.id).remove();
                  if (this.queueData.uploadQueue.length > 0 && this.queueData.queueLength > 0) {
                    if (this.queueData.uploadQueue[0] == '*') {
                      this.startUpload();
                    } else {
                      this.startUpload(this.queueData.uploadQueue.shift());
                    }
                  }
                }
              }
            }
          });
        }
        // Call the user-defined event handler
        if (settings.onUploadStart)
          settings.onUploadStart.call(this, file);
      },
      onUploadSuccess: function (file, data, response) {
        // Load the swfupload settings
        var settings = this.settings;
        var stats = this.getStats();
        this.queueData.uploadsSuccessful = stats.successful_uploads;
        this.queueData.queueBytesUploaded += file.size;
        // Call the default event handler
        if ($.inArray('onUploadSuccess', settings.overrideEvents) < 0) {
          $('#' + file.id).find('.data').html(' - Complete');
        }
        // Call the user-defined event handler
        if (settings.onUploadSuccess)
          settings.onUploadSuccess.call(this, file, data, response);
      }
    };
  $.fn.uploadify = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('The method ' + method + ' does not exist in $.uploadify');
    }
  };
}($));