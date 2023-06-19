import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;

  
    .chat {
        width: 770px;
        height: 370px;
    }
`;

export const FilesArea = styled.div`
    margin-left: 10rem;
    display: flex;
    flex-direction: column;
    width: 26rem;
    height: 100%;
`;

export const UploadFilesArea = styled.div`
    height: 370px;
    background-color: white;
    border-radius: 5px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    overflow: auto;

    h1 {
        display: flex;
        justify-content: center;
        font-size: 18px;
        color: #706d6d;
        font-family: 'Roboto', sans-serif;
        font-weight: 400;

        width: 100%;
        height: 50px;
        box-shadow: 0px 3px 6px 0px #00000029;
    }

    div {
        display: flex;
        width: 100%;
        align-items: center;
        flex-direction: column;
        margin-top: 0.5rem;

        a {
        display: flex;
        background: #C74444;
        height: 30px;
        padding: 0.5rem 1rem;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        cursor: pointer;
        width: 80%;
        font-size: 1rem;
        color: #fff;
        margin-top: 0.5rem;
      }
    }
`;

export const UploadFiles = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    div {
        display: flex;
        button {
            height: 14px;
            width: 14px;
            border-radius: 14px;
            background-color: #fff;
            align-items: center;
            justify-content: center;

            font-size: 1rem;
            color: #C74444;
        }
    }

    h1 {
        color: white;
        font-size: 2rem;
    }

    label {
        display: flex;
        cursor: pointer;
        font-size: 20px;
        color: white;
        background-color: #C74444;
        border: none;
        border-radius: 22px;
        padding: 16px 32px;
        width: 100%;
        align-items: center;
        justify-content: center;

    }

    input {
        display: none;
         }
`;