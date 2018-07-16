import React from 'react';
import PropTypes from 'prop-types';

import Hammer from 'rc-hammerjs';
import omit from 'object.omit';
import splitObject from './util/splitObject';

class Swipeout extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    autoClose: PropTypes.bool,
    disabled: PropTypes.bool,
    left: PropTypes.arrayOf(PropTypes.object),
    right: PropTypes.arrayOf(PropTypes.object),
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    children: PropTypes.any,
  };

  static defaultProps = {
    prefixCls: 'rc-swipeout',
    autoClose: false,
    disabled: false,
    left: [],
    right: [],
    onOpen() {},
    onClose() {},
  };

  constructor(props) {
    super(props);

    this.state = {
      contentStyle: {
        left: 0,
      },
      coverStyle: {
        left: 0,
      },
    };

    this.handleClickContent = this.handleClickContent.bind(this);
    this.onPanStart = this.onPanStart.bind(this);
    this.onPan = this.onPan.bind(this);
    this.onPanEnd = this.onPanEnd.bind(this);
    this.setContentRef = this.setContentRef.bind(this);

    this.openedLeft = false;
    this.openedRight = false;
  }

  componentDidMount() {
    document.body.addEventListener('touchstart', this.onCloseSwipe.bind(this), true);
  }

  componentWillUnmount() {
    document.body.removeEventListener('touchstart', this.onCloseSwipe.bind(this));
  }

  onCloseSwipe(ev) {
    if (this.openedLeft || this.openedRight) {
      const pNode = (node => {
        while (node.parentNode && node.parentNode !== document.body) {
          if (node.className.indexOf(`${this.props.prefixCls}-actions`) > -1) {
            return node;
          }
          node = node.parentNode;
        }
      })(ev.target);
      if (!pNode) {
        ev.preventDefault();
        this.close();
      }
    }
  }

  onPanStart(e) {
    if (this.props.disabled) {
      return;
    }
    const { left, right } = this.props;
    const width = this.content.offsetWidth;

    this.contentWidth = width;
    this.btnsLeftWidth = (width / 5) * left.length;
    this.btnsRightWidth = (width / 5) * right.length;
    this.panStartX = e.deltaX;
  }

  onPan(e) {
    if (this.props.disabled) {
      return;
    }
    const { left, right } = this.props;
    const posX = e.deltaX - this.panStartX;
    if (posX < 0 && right.length) {
      this._setStyle(Math.min(posX, 0));
    } else if (posX > 0 && left.length) {
      this._setStyle(Math.max(posX, 0));
    }
  }

  onPanEnd(e) {
    if (this.props.disabled) {
      return;
    }

    const { left, right } = this.props;
    const posX = e.deltaX - this.panStartX;
    const contentWidth = this.contentWidth;
    const btnsLeftWidth = this.btnsLeftWidth;
    const btnsRightWidth = this.btnsRightWidth;
    const openX = contentWidth * 0.33;
    const openLeft = posX > openX || posX > btnsLeftWidth / 2;
    const openRight = posX < -openX || posX < -btnsRightWidth / 2;

    if (openRight && posX < 0 && right.length) {
      this.open(-btnsRightWidth, false, true);
    } else if (openLeft && posX > 0 && left.length) {
      this.open(btnsLeftWidth, true, false);
    } else {
      this.close();
    }
  }

  // left & right button click
  onBtnClick(ev, btn) {
    const onPress = btn.onPress;
    if (onPress) {
      onPress(ev);
    }
    if (this.props.autoClose) {
      this.close();
    }
  }

  setContentRef(el) {
    this.content = el;
  }

  handleClickContent(e) {
    if (this.openedLeft || this.openedRight) {
      e.stopPropagation();
      this.close();
    }
  }

  _getContentEasing(value, limit) {
    // limit content style left when value > actions width
    if (value < 0 && value < limit) {
      return limit - Math.pow(limit - value, 0.85);
    } else if (value > 0 && value > limit) {
      return limit + Math.pow(value - limit, 0.85);
    } else {
      return value;
    }
  }

  // set content & actions style
  _setStyle(value) {
    if (!this.content) {
      return;
    }

    const nextState = {};
    const { left, right } = this.props;
    const width = this.content.offsetWidth;

    this.contentWidth = width;
    this.btnsLeftWidth = (width / 5) * left.length;
    this.btnsRightWidth = (width / 5) * right.length;

    const limit = value === 0 ? 0 : (value > 0 ? this.btnsLeftWidth : -this.btnsRightWidth);
    const contentLeft = this._getContentEasing(value, limit);

    nextState.contentStyle = {
      left: `${contentLeft}px`,
    };
    nextState.coverStyle = {
      display: Math.abs(value) > 0 ? 'block' : 'none',
      width: `${width}px`,
      left: `${contentLeft}px`,
    };

    if (left.length) {
      const leftWidth = Math.max(Math.min(value, Math.abs(limit)), 0);
      nextState.leftStyle = {
        width: `${leftWidth}px`,
      };
    }
    if (right.length) {

      const rightWidth = Math.max(Math.min(-value, Math.abs(limit)), 0);
      nextState.rightStyle = {
        width: `${rightWidth}px`,
      };
    }

    this.setState(nextState);
  }

  open(value, openedLeft, openedRight) {
    if (!this.openedLeft && !this.openedRight) {
      this.props.onOpen();
    }

    this.openedLeft = openedLeft;
    this.openedRight = openedRight;
    this._setStyle(value);
  }

  close() {
    if (this.openedLeft || this.openedRight) {
      this.props.onClose();
    }
    this._setStyle(0);
    this.openedLeft = false;
    this.openedRight = false;
  }

  renderButtons(buttons, name, style) {
    const prefixCls = this.props.prefixCls;

    return (buttons && buttons.length) ? (
      <div className={`${prefixCls}-actions ${prefixCls}-actions-${name}`} style={style}>
        {buttons.map((btn, i) => {
          return (
            <div key={i}
              className={`${prefixCls}-btn ${btn.hasOwnProperty('className') ? btn.className : ''}`}
              style={btn.style}
              role="button"
              onClick={(e) => this.onBtnClick(e, btn)}
            >
              {btn.button ? btn.button :
                <div className={`${prefixCls}-text`}>
                  {btn.text || 'Click'}
                </div>
              }
            </div>
          );
        })}
      </div>
    ) : null;
  }

  render() {
    const [{ prefixCls, left, right, children }, restProps] = splitObject(
      this.props,
      ['prefixCls', 'left', 'right', 'children']
    );
    const divProps = omit(restProps, [
      'disabled',
      'autoClose',
      'onOpen',
      'onClose',
    ]);
    return (left.length || right.length) ? (
      <div className={`${prefixCls}`} {...divProps}>
        {/* 保证 body touchStart 后不触发 pan */}
        <div className={`${prefixCls}-cover`} onClick={this.handleClickContent} style={this.state.coverStyle} />
        { this.renderButtons(left, 'left', this.state.leftStyle) }
        { this.renderButtons(right, 'right', this.state.rightStyle) }
        <Hammer
          direction="DIRECTION_HORIZONTAL"
          onPanStart={this.onPanStart}
          onPan={this.onPan}
          onPanEnd={this.onPanEnd}
        >
          <div className={`${prefixCls}-content`} ref={this.setContentRef} style={this.state.contentStyle}>
            {children}
          </div>
        </Hammer>
      </div>
    ) : (
      <div ref={this.setContentRef} {...divProps}>{children}</div>
    );
  }
}

export default Swipeout;
