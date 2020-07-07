---
to: packages/<%= packageName %>/<%= elementName %>/src/<%= elementName %>.js
---
import { TemplateElement } from '@webtides/element-js';
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

export function define() {
	defineElement('<%= elementName %>', <%= className %>);
}

