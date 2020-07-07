---
to: packages/<%= packageName %>/<%= elementName %>/stories/<%= elementName %>.stories.js
---
import { Story, Meta, html } from '@open-wc/demoing-storybook';
import { define } from '@webtides/<%= elementName %>';
define();

export default {
    title: 'Elements/<%= className %>',
    component: '<%= elementName %>',
};

export const singleComponent = () => html`
    <<%= elementName %>></<%= elementName %>>
`;

