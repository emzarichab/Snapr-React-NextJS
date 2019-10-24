/**
 * Copyright (c) 2016 Konstantin Kulinicenko.
 * Licensed under the MIT License (MIT), see
 * https://github.com/40818419/react-code-input
 */

/* eslint-disable no-bitwise */
/* eslint-disable jsx-a11y/no-autofocus */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled from 'styled-components';

const BACKSPACE_KEY = 8;
const LEFT_ARROW_KEY = 37;
const UP_ARROW_KEY = 38;
const RIGHT_ARROW_KEY = 39;
const DOWN_ARROW_KEY = 40;

const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;

    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

class ReactCodeInput extends Component {
  constructor(props) {
    super(props);

    const { value, fields, type, isValid, disabled, filterKeyCodes } = props;

    this.state = {
      value,
      fields,
      type,
      input: [],
      isValid,
      disabled,
      filterKeyCodes,
      defaultInputStyle: {
        fontFamily: 'monospace',
        MozAppearance: 'textfield',
        borderRadius: '6px',
        border: '1px solid',
        boxShadow: '0px 0px 10px 0px rgba(0,0,0,.10)',
        margin: '4px',
        padding: '0 0 0 8px',
        width: '36px',
        height: '42px',
        fontSize: '32px',
        boxSizing: 'border-box',
      },
    };

    for (let i = 0; i < Number(this.state.fields); i += 1) {
      if (i < 32) {
        this.state.input.push(this.state.value[i] || '');
      }
    }

    this.textInput = [];

    this.uuid = uuidv4();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isValid: nextProps.isValid,
      value: nextProps.value,
      disabled: nextProps.disabled,
    });
  }

  handleBlur(e) {
    this.handleTouch(e.target.value);
  }

  handleTouch(value) {
    const { touch, untouch, name } = this.props;

    if (typeof touch === 'function' && typeof untouch === 'function') {
      if (value === '') {
        touch(name);
      } else {
        untouch(name);
      }
    }
  }

  handleChange(e) {
    let value = String(e.target.value);

    if (this.state.type === 'number') {
      value = value.replace(/[^\d]/g, '');
    }

    let fullValue = value;

    if (value !== '') {
      const input = this.state.input.slice();

      if (value.length > 1) {
        value.split('').map((chart, i) => {
          if (Number(e.target.dataset.id) + i < this.props.fields) {
            input[Number(e.target.dataset.id) + i] = chart;
          }
          return false;
        });
      } else {
        input[Number(e.target.dataset.id)] = value;
      }

      input.map((s, i) => {
        if (this.textInput[i]) {
          this.textInput[i].value = s;
        }
        return false;
      });

      const newTarget = this.textInput[
        e.target.dataset.id < input.length ? Number(e.target.dataset.id) + 1 : e.target.dataset.id
      ];

      if (newTarget) {
        newTarget.focus();
        newTarget.select();
      }

      fullValue = input.join('');

      this.setState({ value: input.join(''), input });
    }

    if (this.props.onChange && fullValue) {
      this.props.onChange(fullValue);
    }

    this.handleTouch(fullValue);
  }

  handleKeyDown(e) {
    const target = Number(e.target.dataset.id);

    const nextTarget = this.textInput[target + 1];

    const prevTarget = this.textInput[target - 1];

    let input;
    let value;

    if (this.state.filterKeyCodes.length > 0) {
      this.state.filterKeyCodes.map(item => {
        if (item === e.keyCode) {
          e.preventDefault();
          return true;
        }
        return false;
      });
    }

    switch (e.keyCode) {
      case BACKSPACE_KEY:
        e.preventDefault();
        this.textInput[target].value = '';
        input = this.state.input.slice();
        input[target] = '';
        value = input.join('');

        this.setState({ value, input });
        if (this.textInput[target].value === '') {
          if (prevTarget) {
            prevTarget.focus();
            prevTarget.select();
          }
        }
        break;

      case LEFT_ARROW_KEY:
        e.preventDefault();
        if (prevTarget) {
          prevTarget.focus();
          prevTarget.select();
        }
        break;

      case RIGHT_ARROW_KEY:
        e.preventDefault();
        if (nextTarget) {
          nextTarget.focus();
          nextTarget.select();
        }
        break;

      case UP_ARROW_KEY:
        e.preventDefault();
        break;

      case DOWN_ARROW_KEY:
        e.preventDefault();
        break;

      default:
        break;
    }

    if (this.props.onChange && value) {
      this.props.onChange(value);
    }

    this.handleTouch(value);
  }

  render() {
    const {
      className,
      style = {},
      inputStyle = {},
      inputStyleInvalid = {},
      type,
      autoFocus,
      pattern,
      inputMode,
    } = this.props;

    const { disabled, input, isValid, defaultInputStyle } = this.state;

    const styles = {
      container: style,
      input: isValid ? inputStyle : inputStyleInvalid,
    };

    Object.assign(styles.container, {
      display: 'inline-block',
    });

    if (!className && Object.keys(inputStyle).length === 0) {
      Object.assign(inputStyle, {
        ...defaultInputStyle,
        color: 'black',
        backgroundColor: 'white',
        borderColor: 'lightgrey',
      });
    }

    if (!className && Object.keys(inputStyleInvalid).length === 0) {
      Object.assign(inputStyleInvalid, {
        ...defaultInputStyle,
        color: '#b94a48',
        backgroundColor: '#f2dede',
        borderColor: '#eed3d7',
      });
    }

    if (disabled) {
      Object.assign(styles.input, {
        cursor: 'not-allowed',
        color: 'lightgrey',
        borderColor: 'lightgrey',
        backgroundColor: '#efeff1',
      });
    }

    return (
      <div className={classNames(className, 'react-code-input')} style={styles.container}>
        {input.map((value, i) => (
          <CodeInput
            innerRef={ref => {
              this.textInput[i] = ref;
            }}
            id={`${this.uuid}-${i}`}
            data-id={i}
            autoFocus={autoFocus && i === 0 ? 'autoFocus' : ''}
            defaultValue={value}
            key={`input_${i}`}
            type={type}
            min={0}
            max={9}
            maxLength={input.length === i + 1 ? 1 : input.length}
            style={styles.input}
            autoComplete="off"
            onFocus={e => e.target.select(e)}
            onBlur={e => this.handleBlur(e)}
            onChange={e => this.handleChange(e)}
            onKeyDown={e => this.handleKeyDown(e)}
            disabled={disabled}
            data-valid={isValid}
            pattern={pattern}
            inputMode={inputMode}
          />
        ))}
      </div>
    );
  }
}

const CodeInput = styled.input`
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

ReactCodeInput.defaultProps = {
  autoFocus: true,
  isValid: true,
  disabled: false,
  fields: 4,
  value: '',
  type: 'text',
  filterKeyCodes: [189, 190],
};

ReactCodeInput.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'password', 'tel']),
  fields: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  touch: PropTypes.func,
  untouch: PropTypes.func,
  className: PropTypes.string,
  isValid: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  inputStyleInvalid: PropTypes.object,
  autoFocus: PropTypes.bool,
  filterKeyCodes: PropTypes.array,
  pattern: PropTypes.string,
  inputMode: PropTypes.oneOf([
    'verbatim',
    'latin',
    'latin-name',
    'latin-prose',
    'full-width-latin',
    'kana',
    'kana-name',
    'katakana',
    'numeric',
    'tel',
    'email',
    'url',
  ]),
};

export default ReactCodeInput;
