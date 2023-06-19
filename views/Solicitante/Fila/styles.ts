import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: 100%;
`;

export const Button = styled.button`
  height: 50px;
  width: 250px;
  background-color: #fff;
  border-radius: 4px;
  font-weight: bold;
  color: #ee6e66;
  font-size: 1rem;

  @media (max-width: 767px) {
    height: 10vw;
    width: 60vw;
    font-size: 3.5vw;
    margin-top: -3rem;
    margin-bottom: 2rem;
  }
`;
