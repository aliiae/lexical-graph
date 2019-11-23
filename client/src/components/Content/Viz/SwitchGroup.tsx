import Switch, { SwitchProps } from 'antd/lib/switch';
import React from 'react';
import { Link } from 'react-router-dom';
import { RelationType } from '../../../api/types';
import WordnetAPI from '../../../api/WordnetAPI';

interface Options extends SwitchProps {
  id: string;
}

type SwitchGroupProps = {
  type: RelationType;
  disabled: boolean;
  defaultChecked: boolean;
  onChange: (checked: boolean, event: MouseEvent) => void;
};

export default function SwitchGroup(props: SwitchGroupProps): JSX.Element {
  const {
    type, onChange, disabled, defaultChecked,
  } = props;
  const options: Options = {
    id: type,
    title: type,
    onChange,
    disabled,
    defaultChecked,
    size: 'small',
  };
  if (disabled) {
    options.checked = false;
  }
  return (
    <>
      <Switch {...options} />
      <label htmlFor={type}>
        <Link to={`/${type}`} style={{ color: WordnetAPI.colors[type] }}>
          {type.replace('_', ' ')}
        </Link>
      </label>
    </>
  );
}
