import styled from 'styled-components';
import { TextField, Rating } from '@mui/material';

import Card from 'components/Card';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: 100%;
`;

export const CardData = styled(Card)`
  padding: 1.5625rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const DataArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.25rem;
`;

export const Title = styled.h1`
  font-weight: normal;
  font-size: 3rem;
  color: #706d6d;
`;

export const RatingComponent = styled(Rating)`
  font-size: 2.625rem !important;
`;

export const InputText = styled(TextField)`
  background-color: #d0c7c7;
  width: 100%;
  border-radius: 1.875rem;
  margin-bottom: 1.75rem !important;

  fieldset {
    border: none;
  }

  textarea {
    font-size: 1.5rem;
    line-height: 1em;
    color: #706d6d;
  }
`;
