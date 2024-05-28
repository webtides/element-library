const css = String.raw;

export default css`
    [part='wrapper'] {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    [part='input'] {
        text-align: center;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: textfield;
    }

    input[type='number'] {
        -moz-appearance: textfield;
    }

    input[type='number']::-webkit-outer-spin-button,
    input[type='number']::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
`;
