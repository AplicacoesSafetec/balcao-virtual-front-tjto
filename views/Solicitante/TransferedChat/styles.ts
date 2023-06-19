import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const ButtonQuit = styled.button`
  height: 50px;
  width: 250px;
  background-color: #fff;
  border-radius: 4px;
  font-weight: bold;
  color: #ee6e66;
  margin-top: 0;
`;

export const CardData = styled.div`
  background-color: white;
  display: flex;
  width: 46.75rem;
  height: 350px;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 24%) 1px 4px 15px 0px;
`;

export const SidePanel = styled.div`
  display: block;
  width: 260px;
  height: 100%;
  margin-left: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: rgb(0 0 0 / 24%) 1px 4px 15px 0px;

  .header {
    font-family: 'Roboto',sans-serif;
    font-size: 18px;
    color: #706d6d;
    margin-bottom: 20px;
  }

  .topic {
    font-weight: bold;
    margin-bottom: -10px;
  }
`

export const ChatArea = styled.div`
  display: flex;
`

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
