---
to: packages/<%= packageName %>/<%= elementName %>/src/<%= elementName %>.js
---
import { TemplateElement } from '@currentjs/element';
import style from './<%= elementName %>.css';

export default class <%= className %> extends TemplateElement {
    constructor() {
        super({ styles: [style] });
    }

    hooks() {
        return {
            connected: () => {},
        };
    }

    properties() {
        return {};
    }
}

