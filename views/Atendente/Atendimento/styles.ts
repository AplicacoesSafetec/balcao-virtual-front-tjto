import styled from 'styled-components';
import TransparentCard from 'components/Card';

export const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-areas:
    'data link'
    'data atendimento';
  grid-template-columns: 65% 1fr;
  grid-template-rows: 6.25rem 1fr;
  grid-gap: 2.375rem;
  padding: 2.375rem;
`;

export const CardData = styled(TransparentCard)`
  grid-area: data;
  width: 100%;
  height: 100%;
  padding: 1.75rem 0px 1.75rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
`;

export const DataAreaAtendimento = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: flex-start;
`;

export const DataArea = styled.div``;

export const Label = styled.label`
  font-size: 2rem;
  color: #706d6d;
`;

export const Data = styled.h2`
  font-size: 1.875rem;
  color: #ff7d63;
`;

export const LinkMeetChat = styled.a`
  grid-area: link;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  font-size: 3rem;
  background-color: #42a953;
  border-radius: 20px;
  color: white;
  cursor: pointer;
`;

export const CardAtendimento = styled(TransparentCard)`
  grid-area: atendimento;
  padding-bottom: 0.625rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

export const Title = styled.h1`
  font-weight: bold;
  padding-top: 0.625rem;
  font-size: 2.25rem;
  color: #706d6d;
  text-transform: uppercase;
`;

export const Status = styled.p`
  color: #217529;
  font-size: 2.25rem;
  font-weight: bold;
`;
