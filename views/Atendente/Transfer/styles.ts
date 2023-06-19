import styled from 'styled-components';
import Select from 'react-select';
import { TextField } from '@mui/material';
import { FormControl } from '@mui/material';

import Card from 'components/Card';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const SelectBalcao = styled(Select)`
  width: 100%;
  font-size: 1.5rem;
  margin-top: 0.3125rem;
  margin-bottom: 1.375rem;
`;

export const CardQueue = styled(Card)`
  width: 40.5625rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.9375rem 3.125rem;

  form {
    width: 100%;
  }
`;

export const Label = styled.label`
  font-size: 1.375rem;
  line-height: 1em;
`;

export const ButtonArea = styled.div`
  margin-top: 1.25rem;
  align-self: center;
`;

export const Control = styled(FormControl)`
  width: 100%;
`;

export const InputText = styled(TextField)`
  div {
    border-radius: 0.625rem;
    margin-bottom: 0.625rem;
    margin-top: 0.3125rem;
  }

  fieldset {
    border: none;
  }

  input {
    border-radius: 0.6875rem;
    background-color: #c4c4c4;
    font-size: 1.5rem;
  }
`;
