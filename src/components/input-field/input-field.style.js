const css = String.raw;

export default css`
    el-input-field {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .field {
            display: flex;
            align-items: center;
            gap: 8px;

            .validity {
                .valid {
                    color: green;
                }

                .invalid {
                    color: red;
                }
            }
        }

        .message {
            font-size: 14px;
            color: gray;

            &.error-message {
                color: red;
            }
        }
    }
`;
