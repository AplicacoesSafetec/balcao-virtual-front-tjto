import styled from 'styled-components';

export const ChatContainer = styled.main`
  margin-bottom: 0;
  width: 100%;

  #viewOnly {
    height: 300px;
  }

  li {
    list-style-type: none;
  }
`;

export const ChatHeader = styled.div`
  margin-top: 0;
  padding: 12px 0 0 15px;
  width: 100%;
  height: 50px;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  color: #706d6d;
  box-shadow: 0px 3px 6px 0px #00000029;
`;

export const ChatFlow = styled.div`
  margin-bottom: 0;
  padding: 10px;
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  flex: 1 1;
  overflow-x: hidden;
  overflow-y: scroll;

  li {
    list-style-type: none;
    display: table;
  }

  .sent {
    display: flex;
    flex-direction: row-reverse;

    section {
      background-color: #706d6d;
    }
  }

  .received {
    display: flex;

    section {
      background-color: #ff7d63;
    }
  }

  section {
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    margin-top: 10px;
    padding: 7px 16px;
    color: #ffffff;
    display: block;

    a {
      display: flex;
      background: #c74444;
      width: 100%;
      height: 50px;
      padding: 0.5rem 1rem;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      cursor: pointer;
      width: 100%;
      height: 100%;
      font-size: 1rem;
      color: #fff;
    }
  }

  .message-data {
    margin: 10px 0 -5px 0;
    color: black;
    font-size: 12px;
    line-height: 12px;
    display: flex;
  }
  .invisible {
    display: none;
  }
`;

export const Form = styled.form`
  left: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #eeeeee;
  height: 50px;

  .input-box {
    align-items: center;
    background-color: white;
    background-color: var(--df-messenger-input-box-color);
    border-top: 1px solid #eeeeee;
    display: flex;
    font-family: 'Roboto', sans-serif;
    height: 50px;
    z-index: 2;
  }

  input {
    background-color: white;
    background-color: var(--df-messenger-input-box-color);
    border: none;
    border-radius: 0 0 4px 4px;
    color: rgba(0, 0, 0, 0.87);
    color: var(--df-messenger-input-font-color);
    font-size: 14px;
    padding-left: 15px;
    width: 100%;
  }

  button {
    background-color: transparent;
    color: #42a953;

    &:hover {
      color: #42a5f5;
    }

    &:disabled {
      transform: scale(0.01, 0.01);
      transition: 0.3s ease;
    }
  }

  #sendIcon {
    fill: #42a953;
    flex: 0 0 auto;
    height: 24px;
    margin: 15px;
    viewbox: 0 0 24 24;
    width: 24px;
    transform: scale(1, 1);
    transition: 0.3s ease;

    &:hover {
      fill: #42a5f5;
    }
  }
`;

export const Dummy = styled.div`
  visibility: hidden;
  height: 0;
`;
