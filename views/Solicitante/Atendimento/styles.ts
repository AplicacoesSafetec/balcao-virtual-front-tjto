import styled from 'styled-components';
import Card from 'components/Card';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const CardData = styled(Card)`
  padding: 1.5625rem 2.5rem;
  display: flex;
  width: 46.75rem;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 4.375rem;
`;

export const DataArea = styled.div``;

export const Label = styled.label`
  font-size: 2rem;
  color: #706d6d;
`;

export const Data = styled.h2`
  font-size: 1.875rem;
  color: #ff7d63;
  margin-bottom: 0.9375rem;
`;

export const Link = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.375rem 2.0625rem;
  font-size: 1.5625rem;
  background-color: #42a953;
  border-radius: 1.375rem;
  color: white;
`;

export const Title = styled.h1`
  font-weight: normal;
  font-size: 2.8125rem;
  color: #706d6d;
  padding-bottom: 0.9375rem;
`;

export const WelcomeMessage = styled.h1`
  font-size: 3rem;
  font-weight: normal;
  color: white;
`;
