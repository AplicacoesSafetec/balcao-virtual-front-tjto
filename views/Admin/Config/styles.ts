import styled from 'styled-components';

interface ContainerProps {
  isLoading?: boolean;
}

interface ButtonProps {
  active?: boolean;
}

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: ${({ isLoading }) => (isLoading ? 'center' : 'flex-start')};
  justify-content: ${({ isLoading }) => (isLoading ? 'center' : 'flex-start')};
  height: 100%;
  padding-right: 1rem;
`;

export const SideMenu = styled.aside`
  margin-top: 5px;
  width: 300px;
  display: flex;
  flex-direction: column;
`

export const Button = styled.button<ButtonProps>`
  padding: 15px;
  background: ${({ active }) => (active ? 'white' : 'transparent')};
  border: none;
  color: ${({ active }) => (active ? '#FF7D63' : '#fff')};
`