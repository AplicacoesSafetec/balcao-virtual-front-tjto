import styled from 'styled-components';
import Card from 'components/Card';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 25px;
  padding-top: 25px;
  height: 100%;
`;

export const CardQueue = styled(Card)`
  border-radius: 22px;
  padding-top: 10px;
  min-height: 14.375rem;
  width: 46.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

export const WelcomeMessage = styled.h1`
  font-size: 3rem;
  font-weight: normal;
  color: white;
`;
