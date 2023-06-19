import styled from 'styled-components';
import Card from 'components/Card';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: calc(100% - 50px);
`;

export const CardData = styled(Card)`
  padding: 2.5rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const WelcomeMessage = styled.h2`
  font-size: 2.25rem;
  font-weight: normal;
  color: white;
  padding-top: 2.5rem;
`;
