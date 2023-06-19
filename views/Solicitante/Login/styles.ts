import styled from 'styled-components';
import Select from 'react-select';
import { TextField } from '@mui/material';
import { FormControl } from '@mui/material';

import Card from 'components/Card';

const px2rem = (px, base = 16) => `${px / base}rem`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const SelectBalcao = styled(Select)`
  width: 100%;
  font-size: ${px2rem(24)};
  margin-top: ${px2rem(5)};
  margin-bottom: ${px2rem(22)};

  @media (max-width: 767px) {
    font-size: ${px2rem(16)};
    margin-top: ${px2rem(3)};
    margin-bottom: ${px2rem(14)};
  }
`;

export const CardQueue = styled(Card)`
  width: ${px2rem(648)};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${px2rem(15)} ${px2rem(100)};
  background-color: transparent;

  @media (max-width: 767px) {
    width: ${px2rem(320)};
    padding: ${px2rem(9)} ${px2rem(50)};
  }

  form {
    width: 100%;
  }
`;

export const Label = styled.label`
  font-size: ${px2rem(22)};
  line-height: 1em;

  @media (max-width: 767px) {
    font-size: ${px2rem(16)};
  }
`;

export const Button = styled.button`
  height: ${px2rem(80)};
  width: ${px2rem(400)};
  background-color: #fff;
  border-radius: ${px2rem(4)};
  font-weight: bold;
  color: #ee6e66;

  @media (max-width: 767px) {
    height: ${px2rem(64)};
    width: ${px2rem(320)};
    font-size: ${px2rem(16)};
  }
`;

export const ButtonArea = styled.div`
  margin-top: ${px2rem(20)};
  align-self: center;

  @media (max-width: 767px) {
    margin-top: ${px2rem(10)};
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const Control = styled(FormControl)`
  width: 100%;
`;

export const InputText = styled(TextField)`
  div {
    border-radius: ${px2rem(10)};
    margin-bottom: ${px2rem(10)};
    margin-top: ${px2rem(5)};
  }

  fieldset {
    border: none;
  }

  input {
    border-radius: ${px2rem(11)};
    background-color: #c4c4c4;
    font-size: ${px2rem(24)};
  }

  @media (max-width: 767px) {
    input {
      font-size: ${px2rem(16)};
    }
  }
`;
