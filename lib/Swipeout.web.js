'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactHammerjs = require('react-hammerjs');

var _reactHammerjs2 = _interopRequireDefault(_reactHammerjs);

var _object = require('object.omit');

var _object2 = _interopRequireDefault(_object);

var _splitObject3 = require('./util/splitObject');

var _splitObject4 = _interopRequireDefault(_splitObject3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var Swipeout = function (_React$Component) {
  _inherits(Swipeout, _React$Component);

  function Swipeout(props) {
    _classCallCheck(this, Swipeout);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.handleClickContent = _this.handleClickContent.bind(_this);
    _this.onPanStart = _this.onPanStart.bind(_this);
    _this.onPan = _this.onPan.bind(_this);
    _this.onPanEnd = _this.onPanEnd.bind(_this);

    _this.openedLeft = false;
    _this.openedRight = false;
    return _this;
  }

  Swipeout.prototype.componentDidMount = function componentDidMount() {
    var _props = this.props,
        left = _props.left,
        right = _props.right;

    var width = this.refs.content.offsetWidth;

    if (this.refs.cover) {
      this.refs.cover.style.width = width + 'px';
    }

    this.contentWidth = width;
    this.btnsLeftWidth = width / 5 * left.length;
    this.btnsRightWidth = width / 5 * right.length;

    document.body.addEventListener('touchstart', this.onCloseSwipe.bind(this), true);
  };

  Swipeout.prototype.componentWillUnmount = function componentWillUnmount() {
    document.body.removeEventListener('touchstart', this.onCloseSwipe.bind(this));
  };

  Swipeout.prototype.onCloseSwipe = function onCloseSwipe(ev) {
    var _this2 = this;

    if (this.openedLeft || this.openedRight) {
      var pNode = function (node) {
        while (node.parentNode && node.parentNode !== document.body) {
          if (node.className.indexOf(_this2.props.prefixCls + '-actions') > -1) {
            return node;
          }
          node = node.parentNode;
        }
      }(ev.target);
      if (!pNode) {
        ev.preventDefault();
        this.close();
      }
    }
  };

  Swipeout.prototype.onPanStart = function onPanStart(e) {
    if (this.props.disabled) {
      return;
    }
    this.panStartX = e.deltaX;
  };

  Swipeout.prototype.onPan = function onPan(e) {
    if (this.props.disabled) {
      return;
    }
    var _props2 = this.props,
        left = _props2.left,
        right = _props2.right;

    var posX = e.deltaX - this.panStartX;
    if (posX < 0 && right.length) {
      this._setStyle(Math.min(posX, 0));
    } else if (posX > 0 && left.length) {
      this._setStyle(Math.max(posX, 0));
    }
  };

  Swipeout.prototype.onPanEnd = function onPanEnd(e) {
    if (this.props.disabled) {
      return;
    }

    var _props3 = this.props,
        left = _props3.left,
        right = _props3.right;

    var posX = e.deltaX - this.panStartX;
    var contentWidth = this.contentWidth;
    var btnsLeftWidth = this.btnsLeftWidth;
    var btnsRightWidth = this.btnsRightWidth;
    var openX = contentWidth * 0.33;
    var openLeft = posX > openX || posX > btnsLeftWidth / 2;
    var openRight = posX < -openX || posX < -btnsRightWidth / 2;

    if (openRight && posX < 0 && right.length) {
      this.open(-btnsRightWidth, false, true);
    } else if (openLeft && posX > 0 && left.length) {
      this.open(btnsLeftWidth, true, false);
    } else {
      this.close();
    }
  };

  // left & right button click


  Swipeout.prototype.onBtnClick = function onBtnClick(ev, btn) {
    var onPress = btn.onPress;
    if (onPress) {
      onPress(ev);
    }
    if (this.props.autoClose) {
      this.close();
    }
  };

  Swipeout.prototype.handleClickContent = function handleClickContent() {
    if (this.openedLeft || this.openedRight) {
      this.close();
    }
  };

  Swipeout.prototype._getContentEasing = function _getContentEasing(value, limit) {
    // limit content style left when value > actions width
    if (value < 0 && value < limit) {
      return limit - Math.pow(limit - value, 0.85);
    } else if (value > 0 && value > limit) {
      return limit + Math.pow(value - limit, 0.85);
    }
    return value;
  };

  // set content & actions style


  Swipeout.prototype._setStyle = function _setStyle(value) {
    var _props4 = this.props,
        left = _props4.left,
        right = _props4.right;

    var limit = value > 0 ? this.btnsLeftWidth : -this.btnsRightWidth;
    var contentLeft = this._getContentEasing(value, limit);
    this.refs.content.style.left = contentLeft + 'px';
    this.refs.cover.style.display = Math.abs(value) > 0 ? 'block' : 'none';
    this.refs.cover.style.left = contentLeft + 'px';
    if (left.length) {
      var leftWidth = Math.max(Math.min(value, Math.abs(limit)), 0);
      this.refs.left.style.width = leftWidth + 'px';
    }
    if (right.length) {
      var rightWidth = Math.max(Math.min(-value, Math.abs(limit)), 0);
      this.refs.right.style.width = rightWidth + 'px';
    }
  };

  Swipeout.prototype.open = function open(value, openedLeft, openedRight) {
    if (!this.openedLeft && !this.openedRight) {
      this.props.onOpen();
    }

    this.openedLeft = openedLeft;
    this.openedRight = openedRight;
    this._setStyle(value);
  };

  Swipeout.prototype.close = function close() {
    if (this.openedLeft || this.openedRight) {
      this.props.onClose();
    }
    this._setStyle(0);
    this.openedLeft = false;
    this.openedRight = false;
  };

  Swipeout.prototype.renderButtons = function renderButtons(buttons, ref) {
    var _this3 = this;

    var prefixCls = this.props.prefixCls;

    return buttons && buttons.length ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-actions ' + prefixCls + '-actions-' + ref, ref: ref },
      buttons.map(function (btn, i) {
        return _react2["default"].createElement(
          'div',
          { key: i,
            className: prefixCls + '-btn ' + (btn.hasOwnProperty('className') ? btn.className : ''),
            style: btn.style,
            onClick: function onClick(e) {
              return _this3.onBtnClick(e, btn);
            }
          },
          btn.button ? btn.button : _react2["default"].createElement(
            'div',
            { className: prefixCls + '-text' },
            btn.text || 'Click'
          )
        );
      })
    ) : null;
  };

  Swipeout.prototype.render = function render() {
    var _splitObject = (0, _splitObject4["default"])(this.props, ['prefixCls', 'left', 'right', 'children']),
        _splitObject2 = _slicedToArray(_splitObject, 2),
        _splitObject2$ = _splitObject2[0],
        prefixCls = _splitObject2$.prefixCls,
        left = _splitObject2$.left,
        right = _splitObject2$.right,
        children = _splitObject2$.children,
        restProps = _splitObject2[1];

    var divProps = (0, _object2["default"])(restProps, ['disabled', 'autoClose', 'onOpen', 'onClose']);

    return left.length || right.length ? _react2["default"].createElement(
      'div',
      _extends({ className: '' + prefixCls }, divProps),
      _react2["default"].createElement('div', { className: prefixCls + '-cover', ref: 'cover', onClick: this.handleClickContent }),
      this.renderButtons(left, 'left'),
      this.renderButtons(right, 'right'),
      _react2["default"].createElement(
        _reactHammerjs2["default"],
        {
          direction: 'DIRECTION_HORIZONTAL',
          onPanStart: this.onPanStart,
          onPan: this.onPan,
          onPanEnd: this.onPanEnd
        },
        _react2["default"].createElement(
          'div',
          { className: prefixCls + '-content', ref: 'content' },
          children
        )
      )
    ) : _react2["default"].createElement(
      'div',
      _extends({ ref: 'content' }, divProps),
      children
    );
  };

  return Swipeout;
}(_react2["default"].Component);

Swipeout.propTypes = {
  prefixCls: _propTypes2["default"].string,
  autoClose: _propTypes2["default"].bool,
  disabled: _propTypes2["default"].bool,
  left: _propTypes2["default"].arrayOf(_propTypes2["default"].object),
  right: _propTypes2["default"].arrayOf(_propTypes2["default"].object),
  onOpen: _propTypes2["default"].func,
  onClose: _propTypes2["default"].func,
  children: _propTypes2["default"].any
};
Swipeout.defaultProps = {
  prefixCls: 'rc-swipeout',
  autoClose: false,
  disabled: false,
  left: [],
  right: [],
  onOpen: function onOpen() {},
  onClose: function onClose() {}
};
exports["default"] = Swipeout;
module.exports = exports['default'];